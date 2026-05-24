import cardPlaceholder from "../assets/card-placeholder.png"

// Defines shape of data a FilmCard expects
interface FilmCardProps {
    title: string
    category: string
    duration: string
}

export default function FilmCard({ title, category, duration }: FilmCardProps) {
    return (
        <div className="group cursor-pointer flex-shrink-0 w-64 rounded-lg overflow-hidden bg-lumera-surface border border-lumera-border hover:border-lumera-gold transition-all duration-300">
            {/* Image container */}
            <div className="relative">
                <img src={cardPlaceholder} alt={title} className="w-full h-36 object-cover"/>

                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    {/* Play Button */}
                    <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center">
                        <div className="w-0 h-0 border-t-8 border-b-8 border-l-12 border-transparent border-l-white ml-1" />
                    </div>
                </div>
            </div>

            {/* Card text below */}
            <div className="p-3">
                <h3 className="text-white text-sm font-medium truncate">{title}</h3>
                <div className="flex items-center justify-between mt-1">
                    <span className="text-lumera-muted text-xs">{category}</span>
                    <span className="text-lumera-muted text-xs">{duration}</span>
                </div>
            </div>
            
        </div>
    )
}