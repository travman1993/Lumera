import { useEffect, useState, useMemo } from "react"
import { useParams, Link } from "react-router-dom"
import { Search, X } from "lucide-react"
import FilmCard from "../components/FilmCard"
import { type Film, type Category, getFilmsByCategory, getCategories } from "../services/api"

type SortOption = "random" | "az" | "za" | "views" | "likes"

const SORT_LABELS: Record<SortOption, string> = {
  random: "Random",
  az: "A – Z",
  za: "Z – A",
  views: "Most Viewed",
  likes: "Most Liked",
}

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>()

  const [films, setFilms] = useState<Film[]>([])
  const [categoryName, setCategoryName] = useState("")
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState("")
  const [sort, setSort] = useState<SortOption>("random")

  // Fetch category name and all films for this category
  useEffect(() => {
    if (!slug) return
    setLoading(true)
    setSearch("")
    setSort("random")

    Promise.all([
      getFilmsByCategory(slug),
      getCategories(),
    ])
      .then(([filmData, cats]) => {
        setFilms(filmData)
        const cat = cats.find((c: Category) => c.slug === slug)
        setCategoryName(cat?.name ?? slug)
      })
      .catch(() => setFilms([]))
      .finally(() => setLoading(false))
  }, [slug])

  // Apply search filter + sort — purely in the browser, no extra API calls
  const displayed = useMemo(() => {
    let result = [...films]

    // Search: match title or creator name
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (f) =>
          f.title.toLowerCase().includes(q) ||
          (f.creator_display_name ?? f.creator_username).toLowerCase().includes(q)
      )
    }

    // Sort
    switch (sort) {
      case "az":
        result.sort((a, b) => a.title.localeCompare(b.title))
        break
      case "za":
        result.sort((a, b) => b.title.localeCompare(a.title))
        break
      case "views":
        result.sort((a, b) => b.views - a.views)
        break
      case "likes":
        result.sort((a, b) => b.likes_count - a.likes_count)
        break
      // "random" keeps the server-randomized order
    }

    return result
  }, [films, search, sort])

  return (
    <div className="pt-16 min-h-screen">

      {/* Header */}
      <div className="border-b border-lumera-border bg-lumera-surface">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-10">
          <Link
            to="/"
            className="label-overline text-lumera-muted hover:text-lumera-gold transition-colors duration-250 mb-4 inline-block"
          >
            ← Browse
          </Link>
          <h1 className="font-display text-4xl text-lumera-text">
            {categoryName || "Loading…"}
          </h1>
          {!loading && (
            <p className="text-lumera-muted text-sm mt-2">
              {films.length} {films.length === 1 ? "film" : "films"}
            </p>
          )}
        </div>
      </div>

      {/* Search + Sort toolbar */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-lumera-muted pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or creator…"
            className="w-full bg-lumera-surface border border-lumera-border rounded pl-9 pr-9 py-2.5 text-lumera-text text-sm focus:outline-none focus:border-lumera-gold placeholder:text-lumera-muted/50 transition-colors duration-250"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-lumera-muted hover:text-lumera-text transition-colors"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 flex-wrap">
          {(Object.keys(SORT_LABELS) as SortOption[]).map((option) => (
            <button
              key={option}
              onClick={() => setSort(option)}
              className={`text-xs px-3 py-1.5 rounded border transition-all duration-250 ${
                sort === option
                  ? "border-lumera-gold text-lumera-gold bg-lumera-gold/10"
                  : "border-lumera-border text-lumera-muted hover:border-lumera-border-subtle hover:text-lumera-text"
              }`}
            >
              {SORT_LABELS[option]}
            </button>
          ))}
        </div>
      </div>

      {/* Film grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-16">
        {loading ? (
          <div className="flex items-center justify-center py-32 text-lumera-muted text-sm">
            Loading…
          </div>
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <p className="text-lumera-muted text-sm">
              {search ? `No films matching "${search}"` : "No films in this category yet."}
            </p>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-lumera-gold text-xs hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap gap-5">
            {displayed.map((film) => (
              <FilmCard key={film.id} film={film} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
