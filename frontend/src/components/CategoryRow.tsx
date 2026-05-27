import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import FilmCard from "./FilmCard"
import { type Film, getFilmsByCategory } from "../services/api"

interface CategoryRowProps {
  title: string
  slug: string
}

const ROW_LIMIT = 20

export default function CategoryRow({ title, slug }: CategoryRowProps) {
  const [films, setFilms] = useState<Film[]>([])

  useEffect(() => {
    getFilmsByCategory(slug, ROW_LIMIT)
      .then(setFilms)
      .catch(() => setFilms([]))
  }, [slug])

  if (films.length === 0) return null

  const showSeeAll = films.length > 0

  return (
    <div className="mb-12">
      {/* Section header */}
      <div className="px-4 md:px-16 mb-5 flex items-end justify-between">
        <div>
          <p className="label-overline mb-1.5">Category</p>
          <h2 className="font-display text-xl text-lumera-text">{title}</h2>
        </div>
        {showSeeAll && (
          <Link
            to={`/category/${slug}`}
            className="text-xs uppercase tracking-film text-lumera-muted hover:text-lumera-gold transition-colors duration-250 flex items-center gap-1.5 pb-0.5"
          >
            See all <span aria-hidden>→</span>
          </Link>
        )}
      </div>

      {/* Horizontal scroll row */}
      <div className="flex gap-5 overflow-x-auto pb-4 py-2 scrollbar-hide">
        <div className="w-4 md:w-12 flex-shrink-0" />
        {films.map((film) => (
          <FilmCard key={film.id} film={film} />
        ))}
        {/* If there are more, a ghost "See all" card at the end */}
        {showSeeAll && (
          <Link
            to={`/category/${slug}`}
            className="flex-shrink-0 w-48 rounded-lg border border-lumera-border bg-lumera-surface flex flex-col items-center justify-center gap-2 text-lumera-muted hover:border-lumera-gold hover:text-lumera-gold transition-all duration-250"
            style={{ minHeight: "288px" }}
          >
            <span className="text-2xl">→</span>
            <span className="text-xs uppercase tracking-film">See all</span>
          </Link>
        )}
        <div className="w-4 md:w-12 flex-shrink-0" />
      </div>
    </div>
  )
}
