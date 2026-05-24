import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { AtSign, Video, Globe, MapPin } from "lucide-react"
import { type CreatorPublic, getCreator } from "../services/api"
import FilmCard from "../components/FilmCard"

const BASE_URL = "http://127.0.0.1:8000"

function resolveUrl(path: string | undefined): string | undefined {
  if (!path) return undefined
  return path.startsWith("http") ? path : `${BASE_URL}${path}`
}

export default function CreatorProfile() {
  const { id } = useParams<{ id: string }>()
  const [creator, setCreator] = useState<CreatorPublic | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getCreator(id)
      .then(setCreator)
      .catch(() => setCreator(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lumera-muted">
        Loading...
      </div>
    )
  }

  if (!creator) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-lumera-muted text-lg">Creator not found.</p>
        <Link to="/" className="text-lumera-gold hover:underline text-sm">Back to home</Link>
      </div>
    )
  }

  const avatar = resolveUrl(creator.avatar_url)

  return (
    <div className="pt-16 min-h-screen">

      {/* ── Profile header ── */}
      <div className="border-b border-lumera-border bg-lumera-surface">
        <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-start gap-8">

          {/* Avatar */}
          <div className="flex-shrink-0">
            {avatar ? (
              <img
                src={avatar}
                alt={creator.display_name ?? creator.username}
                className="w-24 h-24 rounded-full object-cover border-2 border-lumera-border"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-lumera-border flex items-center justify-center">
                <span className="text-3xl text-lumera-muted font-display">
                  {(creator.display_name ?? creator.username).charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-2 flex-1">
            <h1 className="font-display text-3xl text-white">
              {creator.display_name ?? creator.username}
            </h1>
            <p className="text-lumera-muted text-sm">@{creator.username}</p>

            {creator.location && (
              <p className="flex items-center gap-1.5 text-lumera-muted text-sm">
                <MapPin size={13} /> {creator.location}
              </p>
            )}

            {creator.bio && (
              <p className="text-lumera-muted text-sm leading-relaxed mt-1 max-w-xl">
                {creator.bio}
              </p>
            )}

            {/* Social links */}
            <div className="flex items-center gap-4 mt-2">
              {creator.instagram && (
                <a
                  href={`https://instagram.com/${creator.instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-lumera-muted hover:text-lumera-gold transition-colors text-sm"
                >
                  <AtSign size={14} /> {creator.instagram}
                </a>
              )}
              {creator.youtube && (
                <a
                  href={creator.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-lumera-muted hover:text-lumera-gold transition-colors text-sm"
                >
                  <Video size={14} /> YouTube
                </a>
              )}
              {creator.website && (
                <a
                  href={creator.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-lumera-muted hover:text-lumera-gold transition-colors text-sm"
                >
                  <Globe size={14} /> Website
                </a>
              )}
            </div>
          </div>

          {/* Film count badge */}
          <div className="text-right flex-shrink-0">
            <p className="text-3xl font-bold text-white">{creator.films.length}</p>
            <p className="text-lumera-muted text-xs">Projects</p>
          </div>
        </div>
      </div>

      {/* ── Projects grid ── */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        {creator.films.length === 0 ? (
          <p className="text-lumera-muted text-center py-20">
            No published projects yet.
          </p>
        ) : (
          <>
            <h2 className="text-white text-xl font-semibold mb-6">Projects</h2>
            <div className="flex flex-wrap gap-6">
              {creator.films.map((film) => (
                <FilmCard key={film.id} film={film} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
