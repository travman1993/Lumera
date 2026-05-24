import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { PlayCircle, Heart, Eye, Clock, DollarSign, Camera } from "lucide-react"
import { type Film, getFilmById, likeFilm } from "../services/api"

const BASE_URL = "http://127.0.0.1:8000"

function resolveUrl(path: string | undefined): string | undefined {
  if (!path) return undefined
  return path.startsWith("http") ? path : `${BASE_URL}${path}`
}

export default function FilmDetail() {
  const { id } = useParams<{ id: string }>()
  const [film, setFilm] = useState<Film | null>(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)

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
          <span className="text-lumera-gold text-xs font-medium uppercase tracking-widest">
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
            <video
              src={videoSrc}
              controls
              className="w-full rounded-xl border border-lumera-border aspect-video bg-black"
            />
          ) : (
            <div className="w-full rounded-xl border border-lumera-border aspect-video bg-lumera-surface flex items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-lumera-muted">
                <PlayCircle size={56} strokeWidth={1} />
                <span className="text-sm">No video uploaded yet</span>
              </div>
            </div>
          )}

          {/* Like button */}
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
          </div>

          {/* Description */}
          {film.description && (
            <section>
              <h2 className="text-white text-lg font-semibold mb-3">About this film</h2>
              <p className="text-lumera-muted leading-relaxed whitespace-pre-wrap">
                {film.description}
              </p>
            </section>
          )}

          {/* Production story */}
          {film.production_story && (
            <section>
              <h2 className="text-white text-lg font-semibold mb-3">Production story</h2>
              <p className="text-lumera-muted leading-relaxed whitespace-pre-wrap">
                {film.production_story}
              </p>
            </section>
          )}

          {/* Contributors */}
          {film.contributors && film.contributors.length > 0 && (
            <section>
              <h2 className="text-white text-lg font-semibold mb-4">Credits</h2>
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
            <p className="text-lumera-muted text-xs uppercase tracking-widest mb-3">Creator</p>
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
              <p className="text-lumera-muted text-xs uppercase tracking-widest">Production</p>

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
