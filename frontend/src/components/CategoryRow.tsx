import { useEffect, useState } from "react"
import FilmCard from "./FilmCard"
import { type Film, getFilmsByCategory } from "../services/api"

interface CategoryRowProps {
  title: string
  slug: string
}

export default function CategoryRow({ title, slug }: CategoryRowProps) {
  const [films, setFilms] = useState<Film[]>([])

  useEffect(() => {
    getFilmsByCategory(slug)
      .then(setFilms)
      .catch(() => setFilms([]))
  }, [slug])

  if (films.length === 0) return null

  return (
    <div className="mb-12">
      {/* Overline label + title — editorial section header */}
      <div className="px-16 mb-5">
        <p className="label-overline mb-1.5">Category</p>
        <h2 className="font-display text-xl text-lumera-text">{title}</h2>
      </div>

      {/* Horizontal scroll row */}
      <div className="flex gap-5 overflow-x-auto pb-4 py-2 scrollbar-hide">
        <div className="w-12 flex-shrink-0" />
        {films.map((film) => (
          <FilmCard key={film.id} film={film} />
        ))}
        <div className="w-12 flex-shrink-0" />
      </div>
    </div>
  )
}
