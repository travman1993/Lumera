import { useNavigate } from "react-router-dom"

export default function NotFound() {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
            <h1 className="font-display text-8xl text-lumera-gold mb-4">404</h1>
            <p className="text-lumera-muted text-lg mb-8">This page doesn't exist.</p>
            {/* Clicking sends uder back to home page. */}
            <button onClick={() => navigate("/")} className="px-6 py-3 border border-lumera-gold text-lumera-gold rounded hover:bg-lumera-gold hover:text-black transition-all">Back to Home</button>
        </div>
    )
}