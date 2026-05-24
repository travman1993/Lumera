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
    // Fetch published films for this category whenever the slug changes.
    // If the category has no films yet, the row simply doesn't render.
    getFilmsByCategory(slug)
      .then(setFilms)
      .catch(() => setFilms([]))
  }, [slug])

  // Don't render the row at all if there's nothing to show
  if (films.length === 0) return null

  return (
    <div className="mb-10">
      <h2 className="text-white text-xl font-semibold mb-5 px-16">{title}</h2>

      {/* Horizontal scroll row */}
      <div className="flex gap-6 overflow-x-auto pb-4 py-4 scrollbar-hide">
        <div className="w-10 flex-shrink-0" />
        {films.map((film) => (
          <FilmCard key={film.id} film={film} />
        ))}
        <div className="w-10 flex-shrink-0" />
      </div>
    </div>
  )
}
