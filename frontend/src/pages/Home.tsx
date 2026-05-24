import { useEffect, useState } from "react"
import CategoryRow from "../components/CategoryRow"
import { type Category, getCategories } from "../services/api"
import heroPlaceholder from "../assets/hero-placeholder.png"

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
  }, [])

  return (
    <div className="pt-16">
      {/* Hero */}
      <div className="relative w-full h-[500px] overflow-hidden">
        <img src={heroPlaceholder} alt="Lumera Hero" className="w-full h-full object-cover" />

        <div className="absolute inset-0 bg-gradient-to-t from-lumera-dark via-black/40 to-transparent" />

        <div className="absolute bottom-1/4 left-0 px-16 max-w-2xl">
          <h1 className="font-display text-5xl text-white mb-4">Cinema for Creators</h1>
          <p className="text-lumera-muted text-lg mb-6">
            Discover short films, documentaries, music videos and commercial work from the
            world's best independent creators.
          </p>
          <button className="px-6 py-3 bg-lumera-gold text-black font-semibold rounded hover:bg-lumera-gold-light transition-all">
            Start Watching
          </button>
        </div>
      </div>

      {/* Category rows — only renders rows that have published films */}
      <div className="mt-10">
        {categories.map((cat) => (
          <CategoryRow key={cat.id} title={cat.name} slug={cat.slug} />
        ))}
      </div>
    </div>
  )
}
