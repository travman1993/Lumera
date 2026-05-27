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
      <div className="relative w-full h-[60vh] md:h-[500px] overflow-hidden">
        <img src={heroPlaceholder} alt="Lumera Hero" className="w-full h-full object-cover" />

        <div className="absolute inset-0 bg-gradient-to-t from-lumera-dark via-black/50 to-transparent" />

        <div className="absolute bottom-8 md:bottom-1/4 left-0 px-6 md:px-16 max-w-2xl">
          <p className="label-overline mb-3">Independent Cinema</p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-white mb-4 leading-tight">Cinema for Creators</h1>
          <p className="text-lumera-muted text-sm md:text-base leading-relaxed mb-6 max-w-lg hidden sm:block">
            Discover short films, documentaries, music videos and commercial work from the
            world's best independent creators.
          </p>
          <button className="px-7 py-3 bg-lumera-gold text-black font-semibold rounded hover:bg-lumera-gold-light transition-all duration-250 text-sm tracking-wide">
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
