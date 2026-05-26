import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Eye, Heart, Plus, Trash2, Check, Pencil, X, Camera } from "lucide-react"
import {
  type Film,
  type CreatorPublic,
  type Award,
  getCurrentUser,
  getCreator,
  getMyFilms,
  updateCreatorProfile,
  uploadAvatar,
  updateFilm,
  deleteFilm,
  getToken,
} from "../services/api"

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000"

function resolveUrl(path: string | undefined): string | undefined {
  if (!path) return undefined
  return path.startsWith("http") ? path : `${BASE_URL}${path}`
}

export default function Dashboard() {
  const navigate = useNavigate()

  const [userId, setUserId] = useState<string | null>(null)
  const [creatorData, setCreatorData] = useState<CreatorPublic | null>(null)
  const [films, setFilms] = useState<Film[]>([])
  const [loading, setLoading] = useState(true)

  // Profile edit state
  const [editingProfile, setEditingProfile] = useState(false)
  const [displayName, setDisplayName] = useState("")
  const [bio, setBio] = useState("")
  const [location, setLocation] = useState("")
  const [instagram, setInstagram] = useState("")
  const [youtube, setYoutube] = useState("")
  const [website, setWebsite] = useState("")
  const [gear, setGear] = useState("")
  const [awards, setAwards] = useState<Award[]>([])
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState("")

  useEffect(() => {
    if (!getToken()) { navigate("/login"); return }

    const load = async () => {
      try {
        const user = await getCurrentUser()
        setUserId(user.id)

        const [filmsResult, creatorResult] = await Promise.allSettled([
          getMyFilms(),
          getCreator(user.id),
        ])

        if (filmsResult.status === "fulfilled") setFilms(filmsResult.value)

        if (creatorResult.status === "fulfilled") {
          const c = creatorResult.value
          setCreatorData(c)
          populateForm(c)
        }
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [navigate])

  function populateForm(c: CreatorPublic) {
    setDisplayName(c.display_name ?? "")
    setBio(c.bio ?? "")
    setLocation(c.location ?? "")
    setInstagram(c.instagram ?? "")
    setYoutube(c.youtube ?? "")
    setWebsite(c.website ?? "")
    setGear(c.gear ?? "")
    setAwards(c.awards ?? [])
  }

  const openEdit = () => {
    if (creatorData) populateForm(creatorData)
    setSaveError("")
    setEditingProfile(true)
  }

  const cancelEdit = () => {
    if (creatorData) populateForm(creatorData)
    setEditingProfile(false)
    setSaveError("")
    setAvatarFile(null)
    if (avatarPreview) { URL.revokeObjectURL(avatarPreview); setAvatarPreview(null) }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (avatarPreview) URL.revokeObjectURL(avatarPreview)
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const saveProfile = async () => {
    if (!displayName.trim()) { setSaveError("Display name is required."); return }
    setSaving(true)
    setSaveError("")
    try {
      // Upload new avatar first if one was selected, then include its URL in the profile save
      let newAvatarUrl: string | undefined
      if (avatarFile) {
        const result = await uploadAvatar(avatarFile)
        newAvatarUrl = result.avatar_url
      }

      await updateCreatorProfile({
        display_name: displayName.trim(),
        bio: bio.trim() || undefined,
        location: location.trim() || undefined,
        instagram: instagram.trim() || undefined,
        youtube: youtube.trim() || undefined,
        website: website.trim() || undefined,
        gear: gear.trim() || undefined,
        awards: awards.filter((a) => a.title.trim() && a.festival.trim()),
        avatar_url: newAvatarUrl,
      })

      if (userId) {
        const updated = await getCreator(userId)
        setCreatorData(updated)
      }
      setEditingProfile(false)
      setAvatarFile(null)
      if (avatarPreview) { URL.revokeObjectURL(avatarPreview); setAvatarPreview(null) }
    } catch {
      setSaveError("Failed to save profile. Try again.")
    } finally {
      setSaving(false)
    }
  }

  // Award helpers
  const addAward = () => setAwards([...awards, { title: "", festival: "", year: "" }])
  const removeAward = (i: number) => setAwards(awards.filter((_, idx) => idx !== i))
  const updateAward = (i: number, field: keyof Award, value: string) =>
    setAwards(awards.map((a, idx) => (idx === i ? { ...a, [field]: value } : a)))

  const togglePublish = async (film: Film) => {
    try {
      await updateFilm(film.id, { is_published: !film.is_published })
      setFilms((prev) =>
        prev.map((f) => (f.id === film.id ? { ...f, is_published: !f.is_published } : f))
      )
    } catch { /* silent */ }
  }

  const handleDelete = async (filmId: string) => {
    if (!window.confirm("Delete this film? This cannot be undone.")) return
    try {
      await deleteFilm(filmId)
      setFilms((prev) => prev.filter((f) => f.id !== filmId))
    } catch { /* silent */ }
  }

  const totalViews = films.reduce((sum, f) => sum + f.views, 0)
  const totalLikes = films.reduce((sum, f) => sum + f.likes_count, 0)

  const inputClass =
    "w-full bg-lumera-dark border border-lumera-border rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-lumera-gold placeholder:text-lumera-muted/50"
  const labelClass = "block text-xs text-lumera-muted mb-1"

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lumera-muted">
        Loading...
      </div>
    )
  }

  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-4xl text-white">My Dashboard</h1>
          <Link
            to="/upload"
            className="flex items-center gap-2 px-5 py-2.5 bg-lumera-gold text-black text-sm font-semibold rounded hover:bg-lumera-gold-light transition-all"
          >
            <Plus size={15} /> Upload Film
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: "Films", value: films.length },
            { label: "Total Views", value: totalViews.toLocaleString() },
            { label: "Total Likes", value: totalLikes.toLocaleString() },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-lumera-surface border border-lumera-border rounded-xl p-5 text-center"
            >
              <p className="text-3xl font-bold text-white">{stat.value}</p>
              <p className="text-lumera-muted text-xs mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left column: profile + awards ── */}
          <div className="flex flex-col gap-4">

            {/* Profile card */}
            <div className="bg-lumera-surface border border-lumera-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white font-semibold">Creator Profile</h2>
                {!editingProfile ? (
                  <button
                    onClick={openEdit}
                    className="text-lumera-muted hover:text-lumera-gold transition-colors"
                    title="Edit profile"
                  >
                    <Pencil size={14} />
                  </button>
                ) : (
                  <button
                    onClick={cancelEdit}
                    className="text-lumera-muted hover:text-red-400 transition-colors"
                    title="Cancel"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {!editingProfile ? (
                // ── Read view ──
                <div className="flex flex-col gap-3">
                  <div className="w-16 h-16 rounded-full bg-lumera-border overflow-hidden flex items-center justify-center mb-1 flex-shrink-0">
                    {creatorData?.avatar_url ? (
                      <img
                        src={resolveUrl(creatorData.avatar_url)}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl text-lumera-muted font-display">
                        {(creatorData?.display_name ?? "?").charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {creatorData?.display_name ? (
                    <p className="text-white font-medium">{creatorData.display_name}</p>
                  ) : (
                    <p className="text-lumera-muted italic text-sm">No display name set</p>
                  )}

                  {creatorData?.location && (
                    <p className="text-lumera-muted text-xs">{creatorData.location}</p>
                  )}
                  {creatorData?.bio && (
                    <p className="text-lumera-muted text-xs leading-relaxed">{creatorData.bio}</p>
                  )}
                  {creatorData?.gear && (
                    <div>
                      <p className="text-lumera-muted text-xs uppercase tracking-widest mb-0.5">
                        Gear
                      </p>
                      <p className="text-white text-xs">{creatorData.gear}</p>
                    </div>
                  )}
                  {creatorData?.instagram && (
                    <p className="text-lumera-muted text-xs">{creatorData.instagram}</p>
                  )}

                  {!creatorData?.display_name && (
                    <button
                      onClick={openEdit}
                      className="text-lumera-gold text-xs hover:underline text-left mt-1"
                    >
                      Set up your creator profile →
                    </button>
                  )}
                </div>
              ) : (
                // ── Edit form ──
                <div className="flex flex-col gap-3">
                  {saveError && (
                    <p className="text-red-400 text-xs">{saveError}</p>
                  )}

                  {/* Clickable avatar */}
                  <div className="flex items-center gap-4 mb-1">
                    <label className="relative cursor-pointer group flex-shrink-0">
                      <div className="w-16 h-16 rounded-full bg-lumera-border overflow-hidden flex items-center justify-center">
                        {avatarPreview ? (
                          <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : creatorData?.avatar_url ? (
                          <img src={resolveUrl(creatorData.avatar_url)} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xl text-lumera-muted font-display">
                            {(displayName || "?").charAt(0).toUpperCase()}
                          </span>
                        )}
                        <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Camera size={18} className="text-white" />
                        </div>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="sr-only"
                      />
                    </label>
                    <div>
                      <p className="text-white text-xs font-medium">Profile photo</p>
                      <p className="text-lumera-muted text-xs">Click to change · JPG or PNG</p>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Display name *</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your name"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Bio</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      placeholder="About you..."
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Location</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Los Angeles, CA"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Instagram</label>
                    <input
                      type="text"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      placeholder="@handle"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>YouTube</label>
                    <input
                      type="text"
                      value={youtube}
                      onChange={(e) => setYoutube(e.target.value)}
                      placeholder="Channel URL"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Website</label>
                    <input
                      type="text"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://..."
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Gear kit</label>
                    <input
                      type="text"
                      value={gear}
                      onChange={(e) => setGear(e.target.value)}
                      placeholder="Sony FX3, DJI RS3..."
                      className={inputClass}
                    />
                  </div>

                  <button
                    onClick={saveProfile}
                    disabled={saving || !displayName.trim()}
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-lumera-gold text-black text-sm font-semibold rounded hover:bg-lumera-gold-light transition-all disabled:opacity-50 mt-1"
                  >
                    <Check size={14} /> {saving ? "Saving…" : "Save profile"}
                  </button>
                </div>
              )}
            </div>

            {/* Awards card */}
            <div className="bg-lumera-surface border border-lumera-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold">Awards</h2>
                {editingProfile && (
                  <button
                    onClick={addAward}
                    className="text-lumera-muted hover:text-lumera-gold transition-colors"
                    title="Add award"
                  >
                    <Plus size={14} />
                  </button>
                )}
              </div>

              {!editingProfile && (creatorData?.awards ?? []).length === 0 && (
                <p className="text-lumera-muted text-xs">No awards added yet.</p>
              )}

              {!editingProfile &&
                (creatorData?.awards ?? []).map((award, i) => (
                  <div key={i} className="mb-3 last:mb-0">
                    <p className="text-white text-sm font-medium">{award.title}</p>
                    <p className="text-lumera-muted text-xs">
                      {award.festival}
                      {award.year ? ` · ${award.year}` : ""}
                    </p>
                  </div>
                ))}

              {editingProfile &&
                awards.map((award, i) => (
                  <div
                    key={i}
                    className="flex flex-col gap-2 mb-3 p-3 bg-lumera-dark rounded-lg border border-lumera-border"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lumera-muted text-xs">Award {i + 1}</span>
                      <button
                        onClick={() => removeAward(i)}
                        className="text-lumera-muted hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Award title"
                      value={award.title}
                      onChange={(e) => updateAward(i, "title", e.target.value)}
                      className={inputClass}
                    />
                    <input
                      type="text"
                      placeholder="Festival name"
                      value={award.festival}
                      onChange={(e) => updateAward(i, "festival", e.target.value)}
                      className={inputClass}
                    />
                    <input
                      type="text"
                      placeholder="Year"
                      value={award.year}
                      onChange={(e) => updateAward(i, "year", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                ))}

              {editingProfile && awards.length === 0 && (
                <p className="text-lumera-muted text-xs">
                  Click + to add an award.
                </p>
              )}
            </div>
          </div>

          {/* ── Right column: films ── */}
          <div className="lg:col-span-2">
            <div className="bg-lumera-surface border border-lumera-border rounded-xl p-6">
              <h2 className="text-white font-semibold mb-5">
                My Films{" "}
                <span className="text-lumera-muted text-sm font-normal ml-2">
                  {films.length} total
                </span>
              </h2>

              {films.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-center gap-3">
                  <p className="text-lumera-muted">No films uploaded yet.</p>
                  <Link
                    to="/upload"
                    className="text-lumera-gold text-sm hover:underline"
                  >
                    Upload your first film →
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {films.map((film) => {
                    const thumb = resolveUrl(film.thumbnail_url)
                    return (
                      <div
                        key={film.id}
                        className="flex items-center gap-4 p-3 bg-lumera-dark border border-lumera-border rounded-lg"
                      >
                        {/* Thumbnail */}
                        <div className="w-20 h-14 rounded flex-shrink-0 overflow-hidden bg-lumera-border">
                          {thumb ? (
                            <img
                              src={thumb}
                              alt={film.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">
                            {film.title}
                          </p>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-lumera-muted text-xs">
                              {film.category_name}
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                film.is_published
                                  ? "bg-green-500/15 text-green-400"
                                  : "bg-lumera-border text-lumera-muted"
                              }`}
                            >
                              {film.is_published ? "Published" : "Draft"}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-lumera-muted text-xs">
                            <span className="flex items-center gap-1">
                              <Eye size={10} /> {film.views}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart size={10} /> {film.likes_count}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Link
                            to={`/film/${film.id}`}
                            className="text-xs text-lumera-muted hover:text-white px-2 py-1 border border-lumera-border rounded transition-colors"
                          >
                            View
                          </Link>
                          <Link
                            to={`/upload/${film.id}`}
                            className="text-xs text-lumera-muted hover:text-lumera-gold px-2 py-1 border border-lumera-border rounded transition-colors"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => togglePublish(film)}
                            className={`text-xs px-2 py-1 border rounded transition-colors ${
                              film.is_published
                                ? "border-lumera-border text-lumera-muted hover:border-red-500 hover:text-red-400"
                                : "border-lumera-gold text-lumera-gold hover:bg-lumera-gold hover:text-black"
                            }`}
                          >
                            {film.is_published ? "Unpublish" : "Publish"}
                          </button>
                          <button
                            onClick={() => handleDelete(film.id)}
                            className="text-lumera-muted hover:text-red-400 transition-colors p-1"
                            title="Delete film"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
