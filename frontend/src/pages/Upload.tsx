import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Plus, Trash2 } from "lucide-react"
import {
  type Category,
  type Contributor,
  getCategories,
  uploadFilm,
  updateFilm,
  getFilmById,
  getToken,
} from "../services/api"

export default function Upload() {
  const navigate = useNavigate()
  const { id: editId } = useParams<{ id?: string }>()
  const isEditing = !!editId

  useEffect(() => {
    if (!getToken()) navigate("/login")
  }, [navigate])

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [productionStory, setProductionStory] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [duration, setDuration] = useState("")
  const [budget, setBudget] = useState("")
  const [gearUsed, setGearUsed] = useState("")
  const [isPublished, setIsPublished] = useState(false)
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [cover, setCover] = useState<File | null>(null)
  const [video, setVideo] = useState<File | null>(null)
  const [contributors, setContributors] = useState<Contributor[]>([
    { name: "", role: "", social: "" },
  ])

  // Load categories and (if editing) the existing film data
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
      setIsPublished(film.is_published)
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

    setLoading(true)

    try {
      const filledContributors = contributors.filter((c) => c.name.trim() && c.role.trim())

      if (isEditing && editId) {
        // JSON update — text fields only (files can't be changed via PUT yet)
        await updateFilm(editId, {
          title: title.trim(),
          description: description.trim() || undefined,
          production_story: productionStory.trim() || undefined,
          category_id: categoryId || undefined,
          duration: duration.trim() || undefined,
          budget: budget.trim() || undefined,
          gear_used: gearUsed.trim() || undefined,
          contributors: filledContributors,
          is_published: isPublished,
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
        formData.append("is_published", String(isPublished))
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
                  accept="image/*"
                  onChange={(e) => setThumbnail(e.target.files?.[0] ?? null)}
                  className="w-full text-sm text-lumera-muted file:mr-4 file:py-2 file:px-4 file:rounded file:border file:border-lumera-border file:bg-lumera-surface file:text-lumera-muted file:text-sm hover:file:border-lumera-gold hover:file:text-white cursor-pointer"
                />
                <p className="text-lumera-muted/60 text-xs mt-1.5">
                  <span className="text-lumera-muted">2:3 vertical / portrait</span>{" "}
                  (e.g. 800 × 1200 px) · shown on browse rows as the film card
                </p>
              </div>

              <div>
                <label className={labelClass}>Cover image (banner)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCover(e.target.files?.[0] ?? null)}
                  className="w-full text-sm text-lumera-muted file:mr-4 file:py-2 file:px-4 file:rounded file:border file:border-lumera-border file:bg-lumera-surface file:text-lumera-muted file:text-sm hover:file:border-lumera-gold hover:file:text-white cursor-pointer"
                />
                <p className="text-lumera-muted/60 text-xs mt-1.5">
                  <span className="text-lumera-muted">16:9 horizontal / landscape</span>{" "}
                  (e.g. 1920 × 1080 px) · shown as the wide hero banner on the film page
                </p>
              </div>

              <div>
                <label className={labelClass}>Video file</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideo(e.target.files?.[0] ?? null)}
                  className="w-full text-sm text-lumera-muted file:mr-4 file:py-2 file:px-4 file:rounded file:border file:border-lumera-border file:bg-lumera-surface file:text-lumera-muted file:text-sm hover:file:border-lumera-gold hover:file:text-white cursor-pointer"
                />
                <p className="text-lumera-muted/60 text-xs mt-1.5">
                  Recommended:{" "}
                  <span className="text-lumera-muted">MP4 / H.264</span> · 1080p
                  or 4K · horizontal 16:9
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
                className="grid grid-cols-3 gap-3 items-start bg-lumera-surface border border-lumera-border rounded-lg p-4"
              >
                <div>
                  <label className={labelClass}>Name</label>
                  <input
                    type="text"
                    value={contributor.name}
                    onChange={(e) => updateContributor(index, "name", e.target.value)}
                    placeholder="John Smith"
                    className={inputClass}
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

          {/* ── Publish toggle + submit ── */}
          <section className="flex flex-col gap-6 pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-lumera-border rounded-full peer-checked:bg-lumera-gold transition-colors" />
                <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">
                  {isEditing ? "Published" : "Publish immediately"}
                </p>
                <p className="text-lumera-muted text-xs">
                  {isEditing
                    ? "Toggle to publish or unpublish this project."
                    : "If off, the project is saved as a draft and won't appear publicly."}
                </p>
              </div>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-lumera-gold text-black font-semibold rounded hover:bg-lumera-gold-light transition-all disabled:opacity-50 text-sm"
            >
              {loading
                ? isEditing
                  ? "Saving…"
                  : "Uploading…"
                : isEditing
                  ? "Save changes"
                  : "Upload project"}
            </button>
          </section>
        </form>
      </div>
    </div>
  )
}
