import { Link } from "react-router-dom"
import { PlayCircle } from "lucide-react"
import type { Film } from "../services/api"

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000"

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
      className="group cursor-pointer flex-shrink-0 w-48 rounded-lg overflow-hidden bg-lumera-surface border border-lumera-border hover:border-lumera-border-subtle shadow-card hover:shadow-card-hover transition-all duration-250"
    >
      {/* Thumbnail */}
      <div className="relative">
        {thumbnail ? (
          <img src={thumbnail} alt={film.title} className="w-full h-60 object-cover" />
        ) : (
          <div className="w-full h-60 bg-gradient-to-br from-lumera-surface to-lumera-border flex items-center justify-center">
            <PlayCircle size={40} strokeWidth={1} className="text-lumera-muted" />
          </div>
        )}

        {/* Dark overlay + play icon on hover */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-250 flex items-center justify-center">
          <PlayCircle size={48} strokeWidth={1.5} className="text-white drop-shadow-lg" />
        </div>

        {/* Category badge */}
        {film.category_name && (
          <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-250">
            <span className="text-2xs uppercase tracking-film text-lumera-gold bg-lumera-dark/80 px-2 py-1 rounded">
              {film.category_name}
            </span>
          </div>
        )}
      </div>

      {/* Card text */}
      <div className="p-3">
        <h3 className="text-lumera-text text-sm font-medium leading-snug truncate">{film.title}</h3>
        <p className="text-lumera-gold text-xs truncate mt-0.5 font-medium">
          {film.creator_display_name ?? film.creator_username}
        </p>
        {film.duration && (
          <p className="text-lumera-muted text-xs mt-1">{film.duration}</p>
        )}
      </div>
    </Link>
  )
}
