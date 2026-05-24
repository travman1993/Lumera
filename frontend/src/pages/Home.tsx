import heroPlaceholder from "../assets/hero-placeholder.png"
import CategoryRow from "../components/CategoryRow"

export default function Home() {
    return (
        <div className="pt-16">
            {/* HERO section */}
            {/* Layer text on top */}
            <div className="relative w-full h-[500px overflow-hidden">

                {/* Background img */}
                <img src={heroPlaceholder}
                alt="Lumera Hero"
                className="w-full h-full object-cover"
                />

                {/* Dark grey overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-lumera-dark via-black/40 to-transparent" />

                {/* Hero text on top of image */}
                <div className="absolute bottom-1/4 left-0 px-6 max-w-2xl">
                    <h1 className="font-display text-5xl text-white mb-4">Cinema for Creators</h1>

                    <p className="text-lumera-muted text-lg mb-6">
                        Discover short films, documentaries, music videos and commercial work 
                        from the world's best independant creators.
                    </p>
                    
                    <button className="px-6 py-3 bg-lumera-gold text-black font-semibold rounded hover:bg-lumera-gold-light transition-all">Start Watching</button>

                </div>
            </div>

            {/* Category Rows */}
            {/* Space Between hero and row */}
            <div className="mt-10">
                <CategoryRow title="Short Films" />
                <CategoryRow title="Documentaries" />
                <CategoryRow title="Sports Cinematics" />
                <CategoryRow title="Music Videos" />
                <CategoryRow title="Commercials & Brand Work" />
            </div>
        </div>
    )
}