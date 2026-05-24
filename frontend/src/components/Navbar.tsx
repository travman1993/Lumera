import { Link } from "react-router-dom"

export default function Navbar() {
    return (
        <nav className="fixed top-0 w-full z-50 bg-lumera-dark border-b border-lumera-border">
            {}
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                {/*  Logo links back to homepage */}
                <Link to="/" className="font-display text-2xl text-lumera-gold">Lumera</Link>
                {/* Nav links on right */}
                <div className="flex items-center gap-6">
                    <Link to="/" className="text-sm text-lumera-muted hover:text-white transition-colors">Browse</Link>
                    <Link to="/" className="text-sm text-lumera-muted hover:text-white transition-colors">Creators</Link>
                    {/* Sign in different to stand out */}
                    <Link to="/login" className="text-sm px-4 py-2 border border-lumera-gold text-lumera-gold rounded hover:bg-lumera-gold hover:text-black transition-all">Sign In</Link>
                </div>
            </div>
        </nav>
    )
}