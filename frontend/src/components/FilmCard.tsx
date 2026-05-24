import { Link } from "react-router-dom"
import { PlayCircle } from "lucide-react"
import type { Film } from "../services/api"

const BASE_URL = "http://127.0.0.1:8000"

// Resolves a stored path like "/uploads/thumbnails/abc.jpg" to a full URL
function resolveUrl(path: string | undefined): string | undefined {
  if (!path) return undefined
  return path.startsWith("http") ? path : `${BASE_URL}${path}`
}

interface FilmCardProps {
  film: Film
}

export default function FilmCard({ film }: FilmCardProps) {
  const thumbnail = resolveUrl(film.thumbnail_url)

  return (
    <Link
      to={`/film/${film.id}`}
      className="group cursor-pointer flex-shrink-0 w-48 rounded-lg overflow-hidden bg-lumera-surface border border-lumera-border hover:border-lumera-gold transition-all duration-300"
    >
      {/* Thumbnail */}
      <div className="relative">
        {thumbnail ? (
          <img src={thumbnail} alt={film.title} className="w-full h-60 object-cover" />
        ) : (
          // Placeholder gradient when no thumbnail has been uploaded yet
          <div className="w-full h-60 bg-gradient-to-br from-lumera-surface to-lumera-border flex items-center justify-center">
            <PlayCircle size={40} strokeWidth={1} className="text-lumera-muted" />
          </div>
        )}

        {/* Dark overlay + play button on hover */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <PlayCircle size={48} strokeWidth={1.5} className="text-white" />
        </div>
      </div>

      {/* Card text */}
      <div className="p-3">
        <h3 className="text-white text-md font-medium truncate">{film.title}</h3>
        <p className="text-lumera-gold text-xs truncate mt-0.5">
          {film.creator_display_name ?? film.creator_username}
        </p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-lumera-muted text-xs">{film.category_name}</span>
          {film.duration && (
            <span className="text-lumera-muted text-xs">{film.duration}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
