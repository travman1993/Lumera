import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { PlayCircle, Heart, Eye, Clock, DollarSign, Camera, Flag, X } from "lucide-react"
import { type Film, getFilmById, likeFilm, reportFilm } from "../services/api"

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000"

function resolveUrl(path: string | undefined): string | undefined {
  if (!path) return undefined
  return path.startsWith("http") ? path : `${BASE_URL}${path}`
}

const REPORT_REASONS = [
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "spam", label: "Spam" },
  { value: "copyright", label: "Copyright violation" },
  { value: "wrong_category", label: "Wrong category" },
  { value: "other", label: "Other" },
]

export default function FilmDetail() {
  const { id } = useParams<{ id: string }>()
  const [film, setFilm] = useState<Film | null>(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)

  const [showReport, setShowReport] = useState(false)
  const [reportReason, setReportReason] = useState("inappropriate")
  const [reportDetails, setReportDetails] = useState("")
  const [reportSubmitting, setReportSubmitting] = useState(false)
  const [reportDone, setReportDone] = useState(false)

  const handleReport = async () => {
    if (!film) return
    setReportSubmitting(true)
    try {
      await reportFilm(film.id, reportReason, reportDetails || undefined)
      setReportDone(true)
    } catch {
      // silent fail — report still likely went through
    } finally {
      setReportSubmitting(false)
    }
  }

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getFilmById(id)
      .then((data) => {
        setFilm(data)
        setLikesCount(data.likes_count)
      })
      .catch(() => setFilm(null))
      .finally(() => setLoading(false))
  }, [id])

  const handleLike = async () => {
    if (!film || liked) return
    try {
      const res = await likeFilm(film.id)
      setLikesCount(res.likes_count)
      setLiked(true)
    } catch {
      // silent fail
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lumera-muted">
        Loading...
      </div>
    )
  }

  if (!film) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-lumera-muted text-lg">Film not found.</p>
        <Link to="/" className="text-lumera-gold hover:underline text-sm">Back to home</Link>
      </div>
    )
  }

  const thumbnail = resolveUrl(film.thumbnail_url)
  const coverSrc = resolveUrl(film.cover_url) ?? thumbnail
  const videoSrc = resolveUrl(film.video_url)

  return (
    <div className="pt-16 min-h-screen">

      {/* ── Horizontal hero banner ── */}
      <div className="relative w-full h-[420px] overflow-hidden">
        {coverSrc ? (
          <img src={coverSrc} alt={film.title} className="w-full h-full object-cover object-center" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-lumera-surface to-lumera-border" />
        )}
        {/* Heavy gradient at the bottom so the poster + title sit on a readable surface */}
        <div className="absolute inset-0 bg-gradient-to-t from-lumera-dark via-lumera-dark/40 to-transparent" />

        <div className="absolute top-6 left-6">
          <span className="label-overline text-lumera-gold">
            {film.category_name}
          </span>
        </div>
      </div>

      {/* ── Poster + title row (overlaps the hero) ── */}
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex items-end gap-6 -mt-24 mb-10 relative z-10">

          {/* Vertical poster */}
          <div className="w-36 flex-shrink-0 rounded-lg overflow-hidden border border-lumera-border shadow-2xl" style={{ aspectRatio: "2/3" }}>
            {thumbnail ? (
              <img src={thumbnail} alt={film.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-lumera-surface" />
            )}
          </div>

          {/* Title + meta */}
          <div className="pb-1 min-w-0">
            <h1 className="font-display text-4xl lg:text-5xl text-white leading-tight">{film.title}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-lumera-muted text-sm">
              <Link
                to={`/creator/${film.creator_id}`}
                className="text-white hover:text-lumera-gold transition-colors font-medium"
              >
                {film.creator_display_name ?? film.creator_username}
              </Link>
              {film.duration && (
                <span className="flex items-center gap-1.5"><Clock size={13} />{film.duration}</span>
              )}
              <span className="flex items-center gap-1.5"><Eye size={13} />{film.views.toLocaleString()} views</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-5xl mx-auto px-6 pb-10 grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* Left column — main content */}
        <div className="lg:col-span-2 flex flex-col gap-8">

          {/* Video player */}
          {videoSrc ? (
            videoSrc.includes("iframe.cloudflarestream.com") ? (
              <iframe
                src={videoSrc}
                className="w-full rounded-xl border border-lumera-border aspect-video bg-black"
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                src={videoSrc}
                controls
                className="w-full rounded-xl border border-lumera-border aspect-video bg-black"
              />
            )
          ) : (
            <div className="w-full rounded-xl border border-lumera-border aspect-video bg-lumera-surface flex items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-lumera-muted">
                <PlayCircle size={56} strokeWidth={1} />
                <span className="text-sm">No video uploaded yet</span>
              </div>
            </div>
          )}

          {/* Like + Report buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleLike}
              disabled={liked}
              className={`flex items-center gap-2 px-5 py-2.5 rounded border transition-all text-sm font-medium
                ${liked
                  ? "border-lumera-gold text-lumera-gold bg-lumera-gold/10 cursor-default"
                  : "border-lumera-border text-lumera-muted hover:border-lumera-gold hover:text-lumera-gold"
                }`}
            >
              <Heart size={15} fill={liked ? "currentColor" : "none"} />
              {liked ? "Liked" : "Like"} · {likesCount}
            </button>

            <button
              onClick={() => setShowReport(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded border border-lumera-border text-lumera-muted hover:border-red-500/50 hover:text-red-400 transition-all text-sm"
            >
              <Flag size={13} />
              Report
            </button>
          </div>

          {/* Report modal */}
          {showReport && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
              <div className="bg-lumera-surface border border-lumera-border rounded-xl p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-white font-semibold">Report this video</h3>
                  <button onClick={() => { setShowReport(false); setReportDone(false) }} className="text-lumera-muted hover:text-white transition-colors">
                    <X size={18} />
                  </button>
                </div>

                {reportDone ? (
                  <div className="text-center py-4">
                    <p className="text-white font-medium mb-1">Report submitted</p>
                    <p className="text-lumera-muted text-sm">Thanks for helping keep Lumera a quality platform.</p>
                    <button
                      onClick={() => { setShowReport(false); setReportDone(false) }}
                      className="mt-5 px-5 py-2 bg-lumera-gold text-black text-sm font-medium rounded hover:bg-lumera-gold-light transition-colors"
                    >
                      Close
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm text-lumera-muted mb-2">Reason</label>
                      <select
                        value={reportReason}
                        onChange={(e) => setReportReason(e.target.value)}
                        className="w-full bg-lumera-dark border border-lumera-border rounded px-3 py-2.5 text-white text-sm focus:outline-none focus:border-lumera-gold"
                      >
                        {REPORT_REASONS.map((r) => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-5">
                      <label className="block text-sm text-lumera-muted mb-2">Additional details (optional)</label>
                      <textarea
                        value={reportDetails}
                        onChange={(e) => setReportDetails(e.target.value)}
                        rows={3}
                        placeholder="Describe the issue..."
                        className="w-full bg-lumera-dark border border-lumera-border rounded px-3 py-2.5 text-white text-sm focus:outline-none focus:border-lumera-gold placeholder:text-lumera-muted/40 resize-none"
                      />
                    </div>

                    <div className="flex gap-3 justify-end">
                      <button
                        onClick={() => setShowReport(false)}
                        className="px-4 py-2 text-lumera-muted hover:text-white text-sm transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleReport}
                        disabled={reportSubmitting}
                        className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded transition-colors disabled:opacity-50"
                      >
                        {reportSubmitting ? "Submitting…" : "Submit report"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          {film.description && (
            <section>
              <p className="label-overline mb-2">About this film</p>
              <p className="text-lumera-muted leading-relaxed whitespace-pre-wrap">
                {film.description}
              </p>
            </section>
          )}

          {/* Production story */}
          {film.production_story && (
            <section>
              <p className="label-overline mb-2">Production story</p>
              <p className="text-lumera-muted leading-relaxed whitespace-pre-wrap">
                {film.production_story}
              </p>
            </section>
          )}

          {/* Contributors */}
          {film.contributors && film.contributors.length > 0 && (
            <section>
              <p className="label-overline mb-4">Credits</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {film.contributors.map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-lumera-surface border border-lumera-border rounded-lg px-4 py-3"
                  >
                    <div>
                      <p className="text-white text-sm font-medium">{c.name}</p>
                      <p className="text-lumera-muted text-xs">{c.role}</p>
                    </div>
                    {c.social && (
                      <span className="text-lumera-gold text-xs">{c.social}</span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right column — production details */}
        <aside className="flex flex-col gap-6">
          {/* Creator card */}
          <div className="bg-lumera-surface border border-lumera-border rounded-xl p-5">
            <p className="label-overline mb-3">Creator</p>
            <Link
              to={`/creator/${film.creator_id}`}
              className="text-white font-semibold hover:text-lumera-gold transition-colors"
            >
              {film.creator_display_name ?? film.creator_username}
            </Link>
            <p className="text-lumera-muted text-xs mt-1">@{film.creator_username}</p>
          </div>

          {/* Production details */}
          {(film.budget || film.gear_used) && (
            <div className="bg-lumera-surface border border-lumera-border rounded-xl p-5 flex flex-col gap-4">
              <p className="label-overline">Production</p>

              {film.budget && (
                <div className="flex items-start gap-3">
                  <DollarSign size={15} className="text-lumera-gold mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-lumera-muted text-xs">Budget</p>
                    <p className="text-white text-sm">{film.budget}</p>
                  </div>
                </div>
              )}

              {film.gear_used && (
                <div className="flex items-start gap-3">
                  <Camera size={15} className="text-lumera-gold mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-lumera-muted text-xs">Gear used</p>
                    <p className="text-white text-sm leading-relaxed">{film.gear_used}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
