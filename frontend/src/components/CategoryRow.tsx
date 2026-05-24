import FilmCard from "./FilmCard"

interface CategoryRowProps {
    title: string // Heading of the row "Short films"
}

// Placeholder films
const placeholderFilms = [
    { title: "Golden Hour", category: "Short Film", duration: "12 min"},
    { title: "Neon Drift", category: "Commercial", duration: "3 min"},
    { title: "The Last Frame", category: "Documentary", duration: "28 min"},
    { title: "Velocity", category: "Sports", duration: "8 min"},
    { title: "Fade In", category: "Short Film", duration: "15 min"},
    { title: "Chroma", category: "Music Video", duration: "4 min"},
]

export default function CategoryRow({title}: CategoryRowProps) {
    return (
        <div className="mb-10">

            {/* Row Heading */}
            <h2 className="text-white text-xl font-semibold mb-4 px-6">
                {title}
            </h2>

            {/* Horizontal scrolling on overflow */}
            <div className="flex gap-4 overflow-x-auto px6 pb-4">
                {placeholderFilms.map((film, index) => (
                    // Required key
                    <FilmCard
                        key={index}
                        title={film.title}
                        category={film.category}
                        duration={film.duration}
                    />
                ))}
            </div>
            
        </div>
    )
}