import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Plus, Trash2 } from "lucide-react"
import {
  type Category,
  type Contributor,
  type FilmVisibility,
  type AgreementStatus,
  getCategories,
  uploadFilm,
  updateFilm,
  getFilmById,
  getAgreementStatus,
  acceptAgreement,
  getToken,
} from "../services/api"

export default function Upload() {
  const navigate = useNavigate()
  const { id: editId } = useParams<{ id?: string }>()
  const isEditing = !!editId

  useEffect(() => {
    if (!getToken()) { navigate("/login"); return }
    getAgreementStatus()
      .then((status) => { setAgreement(status); setAgreementChecked(true) })
      .catch(() => setAgreementChecked(true)) // on error, don't block the page
  }, [navigate])

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Creator Agreement gate
  const [agreement, setAgreement] = useState<AgreementStatus | null>(null)
  const [agreementChecked, setAgreementChecked] = useState(false)
  const [agreementAccepting, setAgreementAccepting] = useState(false)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [productionStory, setProductionStory] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [duration, setDuration] = useState("")
  const [budget, setBudget] = useState("")
  const [gearUsed, setGearUsed] = useState("")
  const [visibility, setVisibility] = useState<FilmVisibility>("draft")
  const [copyrightAcknowledged, setCopyrightAcknowledged] = useState(false)
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [cover, setCover] = useState<File | null>(null)
  const [video, setVideo] = useState<File | null>(null)
  const [contributors, setContributors] = useState<Contributor[]>([
    { name: "", role: "", social: "" },
  ])

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setError("Could not load categories — is the backend running?"))
  }, [])

  useEffect(() => {
    if (!editId) return
    getFilmById(editId).then((film) => {
      setTitle(film.title)
      setDescription(film.description ?? "")
      setProductionStory(film.production_story ?? "")
      setCategoryId(film.category_id)
      setDuration(film.duration ?? "")
      setBudget(film.budget ?? "")
      setGearUsed(film.gear_used ?? "")
      setVisibility(film.visibility ?? "draft")
      if (film.contributors.length > 0) {
        setContributors(
          film.contributors.map((c) => ({
            name: c.name,
            role: c.role,
            social: c.social ?? "",
          }))
        )
      }
    })
  }, [editId])

  // ── Contributor helpers ──────────────────────────────────────────────────

  const addContributor = () =>
    setContributors([...contributors, { name: "", role: "", social: "" }])

  const removeContributor = (index: number) =>
    setContributors(contributors.filter((_, i) => i !== index))

  const updateContributor = (index: number, field: keyof Contributor, value: string) => {
    setContributors(contributors.map((c, i) => (i === index ? { ...c, [field]: value } : c)))
  }

  // ── Submit ───────────────────────────────────────────────────────────────

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault()
    setError("")

    if (!title.trim()) return setError("Title is required.")
    if (!isEditing && !categoryId) return setError("Please select a category.")

    if (visibility === "public" && !copyrightAcknowledged) {
      return setError(
        "You must confirm copyright ownership before publishing publicly."
      )
    }

    setLoading(true)

    try {
      const filledContributors = contributors.filter((c) => c.name.trim() && c.role.trim())

      if (isEditing && editId) {
        await updateFilm(editId, {
          title: title.trim(),
          description: description.trim() || undefined,
          production_story: productionStory.trim() || undefined,
          category_id: categoryId || undefined,
          duration: duration.trim() || undefined,
          budget: budget.trim() || undefined,
          gear_used: gearUsed.trim() || undefined,
          contributors: filledContributors,
          visibility,
          is_published: visibility === "public",
        })
        navigate(`/film/${editId}`)
      } else {
        const formData = new FormData()
        formData.append("title", title.trim())
        formData.append("description", description.trim())
        formData.append("production_story", productionStory.trim())
        formData.append("category_id", categoryId)
        formData.append("duration", duration.trim())
        formData.append("budget", budget.trim())
        formData.append("gear_used", gearUsed.trim())
        formData.append("contributors", JSON.stringify(filledContributors))
        formData.append("visibility", visibility)
        formData.append("copyright_acknowledged", String(copyrightAcknowledged))
        if (thumbnail) formData.append("thumbnail", thumbnail)
        if (cover) formData.append("cover", cover)
        if (video) formData.append("video", video)

        const film = await uploadFilm(formData)
        navigate(`/film/${film.id}`)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save film")
    } finally {
      setLoading(false)
    }
  }

  // ── Shared styles ────────────────────────────────────────────────────────

  const inputClass =
    "w-full bg-lumera-dark border border-lumera-border rounded px-4 py-3 text-lumera-text text-sm focus:outline-none focus:border-lumera-gold placeholder:text-lumera-muted/50 transition-colors duration-250"

  const labelClass = "block text-2xs uppercase tracking-film text-lumera-muted mb-2"

  const handleAcceptAgreement = async () => {
    if (!agreement?.agreement_id) return
    setAgreementAccepting(true)
    try {
      await acceptAgreement(agreement.agreement_id)
      setAgreement((prev) => prev ? { ...prev, accepted: true } : prev)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to accept agreement.")
    } finally {
      setAgreementAccepting(false)
    }
  }

  // Show agreement modal if we've checked and it hasn't been accepted
  if (agreementChecked && agreement && !agreement.accepted) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-lg bg-lumera-surface border border-lumera-border rounded-xl p-8">

          <p className="label-overline text-lumera-gold mb-3">Before you upload</p>
          <h2 className="font-display text-2xl text-white mb-4">{agreement.title ?? "Creator Agreement"}</h2>

          <p className="text-lumera-muted text-sm leading-relaxed mb-6">
            To upload and publish films on Lumera, you must accept our Creator Agreement. By accepting, you confirm that:
          </p>

          <ul className="flex flex-col gap-2.5 mb-6">
            {[
              "You own or have permission to use all content you upload",
              "You are solely responsible for any copyright issues",
              "Lumera may remove content that violates its guidelines",
              "Repeat violations may result in account termination",
              "You grant Lumera a license to stream and display your content",
              "You agree to follow the Creator Guidelines",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-lumera-muted">
                <span className="text-lumera-gold mt-0.5 flex-shrink-0">✓</span>
                {item}
              </li>
            ))}
          </ul>

          <p className="text-lumera-muted/60 text-xs mb-6">
            Agreement version {agreement.version}.{" "}
            <a href={agreement.content_url} target="_blank" rel="noreferrer" className="text-lumera-gold hover:underline">
              Read full terms →
            </a>
          </p>

          {error && (
            <p className="text-red-400 text-sm mb-4">{error}</p>
          )}

          <button
            onClick={handleAcceptAgreement}
            disabled={agreementAccepting}
            className="w-full py-3 bg-lumera-gold text-black font-semibold rounded hover:bg-lumera-gold-light transition-all disabled:opacity-50 text-sm"
          >
            {agreementAccepting ? "Accepting…" : "I Accept — Continue to Upload"}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-12">

        <h1 className="font-display text-4xl text-white mb-2">
          {isEditing ? "Edit Project" : "Upload a Project"}
        </h1>
        <p className="text-lumera-muted text-sm mb-10">
          {isEditing
            ? "Update your film's details below."
            : "Share your work with the Lumera community."}
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm rounded px-4 py-3 mb-8">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">

          {/* ── Core info ── */}
          <section className="flex flex-col gap-5">
            <div className="border-b border-lumera-border pb-3">
              <p className="label-overline mb-1">Film details</p>
            </div>

            <div>
              <label className={labelClass}>Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My Short Film"
                className={inputClass}
                required
                maxLength={120}
              />
            </div>

            <div>
              <label className={labelClass}>Category *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className={inputClass}
                required={!isEditing}
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="What is this project about?"
                className={inputClass}
                maxLength={3000}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Duration</label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 12 min"
                  className={inputClass}
                  maxLength={30}
                />
              </div>
              <div>
                <label className={labelClass}>Budget</label>
                <input
                  type="text"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="e.g. $5,000"
                  className={inputClass}
                  maxLength={50}
                />
              </div>
            </div>
          </section>

          {/* ── Files (upload only) ── */}
          {!isEditing && (
            <section className="flex flex-col gap-5">
              <div className="border-b border-lumera-border pb-3">
                <p className="label-overline mb-1">Files</p>
              </div>

              <div>
                <label className={labelClass}>Poster / thumbnail</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setThumbnail(e.target.files?.[0] ?? null)}
                  className="w-full text-sm text-lumera-muted file:mr-4 file:py-2 file:px-4 file:rounded file:border file:border-lumera-border file:bg-lumera-surface file:text-lumera-muted file:text-sm hover:file:border-lumera-gold hover:file:text-white cursor-pointer"
                />
                <p className="text-lumera-muted/60 text-xs mt-1.5">
                  <span className="text-lumera-muted">2:3 vertical / portrait</span>{" "}
                  (e.g. 800 × 1200 px) · JPEG, PNG, or WebP · max 10 MB
                </p>
              </div>

              <div>
                <label className={labelClass}>Cover image (banner)</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setCover(e.target.files?.[0] ?? null)}
                  className="w-full text-sm text-lumera-muted file:mr-4 file:py-2 file:px-4 file:rounded file:border file:border-lumera-border file:bg-lumera-surface file:text-lumera-muted file:text-sm hover:file:border-lumera-gold hover:file:text-white cursor-pointer"
                />
                <p className="text-lumera-muted/60 text-xs mt-1.5">
                  <span className="text-lumera-muted">16:9 horizontal / landscape</span>{" "}
                  (e.g. 1920 × 1080 px) · JPEG, PNG, or WebP · max 10 MB
                </p>
              </div>

              <div>
                <label className={labelClass}>Video file</label>
                <input
                  type="file"
                  accept="video/mp4,video/quicktime,video/webm"
                  onChange={(e) => setVideo(e.target.files?.[0] ?? null)}
                  className="w-full text-sm text-lumera-muted file:mr-4 file:py-2 file:px-4 file:rounded file:border file:border-lumera-border file:bg-lumera-surface file:text-lumera-muted file:text-sm hover:file:border-lumera-gold hover:file:text-white cursor-pointer"
                />
                <p className="text-lumera-muted/60 text-xs mt-1.5">
                  Recommended:{" "}
                  <span className="text-lumera-muted">MP4 / H.264</span> · 1080p or 4K · max 500 MB
                </p>
              </div>
            </section>
          )}

          {/* ── Production details ── */}
          <section className="flex flex-col gap-5">
            <div className="border-b border-lumera-border pb-3">
              <p className="label-overline mb-1">Production details</p>
            </div>

            <div>
              <label className={labelClass}>Gear used</label>
              <input
                type="text"
                value={gearUsed}
                onChange={(e) => setGearUsed(e.target.value)}
                placeholder="Sony FX3, DJI RS3, Sigma 35mm 1.4"
                className={inputClass}
                maxLength={500}
              />
            </div>

            <div>
              <label className={labelClass}>Production story</label>
              <textarea
                value={productionStory}
                onChange={(e) => setProductionStory(e.target.value)}
                rows={4}
                placeholder="How did this project come together?"
                className={inputClass}
                maxLength={3000}
              />
            </div>
          </section>

          {/* ── Contributors ── */}
          <section className="flex flex-col gap-4">
            <div className="border-b border-lumera-border pb-3">
              <p className="label-overline mb-1">Contributors</p>
            </div>

            {contributors.map((contributor, index) => (
              <div
                key={index}
                className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start bg-lumera-surface border border-lumera-border rounded-lg p-4"
              >
                <div>
                  <label className={labelClass}>Name</label>
                  <input
                    type="text"
                    value={contributor.name}
                    onChange={(e) => updateContributor(index, "name", e.target.value)}
                    placeholder="John Smith"
                    className={inputClass}
                    maxLength={80}
                  />
                </div>
                <div>
                  <label className={labelClass}>Role</label>
                  <input
                    type="text"
                    value={contributor.role}
                    onChange={(e) => updateContributor(index, "role", e.target.value)}
                    placeholder="Editor"
                    className={inputClass}
                    maxLength={80}
                  />
                </div>
                <div className="relative">
                  <label className={labelClass}>Social</label>
                  <input
                    type="text"
                    value={contributor.social ?? ""}
                    onChange={(e) => updateContributor(index, "social", e.target.value)}
                    placeholder="@handle"
                    className={inputClass}
                  />
                  {contributors.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeContributor(index)}
                      className="absolute -top-1 -right-1 text-lumera-muted hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addContributor}
              className="flex items-center gap-2 text-sm text-lumera-muted hover:text-lumera-gold transition-colors self-start"
            >
              <Plus size={14} /> Add contributor
            </button>
          </section>

          {/* ── Visibility + publish ── */}
          <section className="flex flex-col gap-6 pt-2">
            <div className="border-b border-lumera-border pb-3">
              <p className="label-overline mb-1">Visibility</p>
            </div>

            <div className="flex flex-col gap-3">
              {(
                [
                  {
                    value: "draft" as FilmVisibility,
                    label: "Draft",
                    description: "Only you can see this. It won't appear anywhere publicly.",
                  },
                  {
                    value: "unlisted" as FilmVisibility,
                    label: "Unlisted",
                    description: "Anyone with the direct link can watch it, but it won't appear in browse or search.",
                  },
                  {
                    value: "public" as FilmVisibility,
                    label: "Public",
                    description: "Visible to everyone on Lumera.",
                  },
                ] as const
              ).map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                    visibility === opt.value
                      ? "border-lumera-gold bg-lumera-gold/5"
                      : "border-lumera-border hover:border-lumera-gold/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="visibility"
                    value={opt.value}
                    checked={visibility === opt.value}
                    onChange={() => {
                      setVisibility(opt.value)
                      // Reset copyright acknowledgement when moving away from public
                      if (opt.value !== "public") setCopyrightAcknowledged(false)
                    }}
                    className="mt-0.5 accent-lumera-gold flex-shrink-0"
                  />
                  <div>
                    <p className="text-white text-sm font-medium">{opt.label}</p>
                    <p className="text-lumera-muted text-xs mt-0.5">{opt.description}</p>
                  </div>
                </label>
              ))}
            </div>

            {/* Copyright acknowledgement — only required when publishing publicly */}
            {visibility === "public" && (
              <div className="bg-amber-500/5 border border-amber-500/30 rounded-lg p-4">
                <p className="text-amber-400 text-xs font-medium uppercase tracking-wide mb-3">
                  Copyright confirmation required to publish
                </p>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={copyrightAcknowledged}
                    onChange={(e) => setCopyrightAcknowledged(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded accent-lumera-gold flex-shrink-0 cursor-pointer"
                  />
                  <span className="text-sm text-lumera-muted group-hover:text-lumera-text transition-colors leading-snug">
                    I certify that I own or have permission to use all content included in this
                    project — including footage, music, images, and any trademarks shown.
                  </span>
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (visibility === "public" && !copyrightAcknowledged)}
              className="w-full py-4 bg-lumera-gold text-black font-semibold rounded hover:bg-lumera-gold-light transition-all disabled:opacity-50 text-sm"
            >
              {loading
                ? isEditing
                  ? "Saving…"
                  : "Uploading…"
                : isEditing
                  ? "Save changes"
                  : visibility === "public"
                    ? "Upload & Publish"
                    : visibility === "unlisted"
                      ? "Upload as Unlisted"
                      : "Save as Draft"}
            </button>
          </section>
        </form>
      </div>
    </div>
  )
}
