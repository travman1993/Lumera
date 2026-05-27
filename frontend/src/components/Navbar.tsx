import { Link, useNavigate } from "react-router-dom"
import { getToken, getUsername, removeToken, removeUsername } from "../services/api"

export default function Navbar() {
    const navigate = useNavigate()
    const token = getToken()
    const username = getUsername()

    const handleLogout = () => {
        removeToken()
        removeUsername()
        navigate("/login")
    }

    return (
        <nav className="fixed top-0 w-full z-50 bg-lumera-dark/90 backdrop-blur-md border-b border-lumera-border/60">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

                <Link
                    to="/"
                    className="font-display text-2xl text-lumera-gold tracking-wide hover:text-lumera-gold-light transition-colors duration-250"
                >
                    Lumera
                </Link>

                <div className="flex items-center gap-8">
                    <Link
                        to="/"
                        className="text-xs uppercase tracking-film text-lumera-muted hover:text-lumera-text transition-colors duration-250"
                    >
                        Browse
                    </Link>

                    {token && username ? (
                        <div className="flex items-center gap-5">
                            <Link
                                to="/dashboard"
                                className="text-xs uppercase tracking-film text-lumera-muted hover:text-lumera-text transition-colors duration-250"
                            >
                                Dashboard
                            </Link>
                            <span className="text-xs text-lumera-gold font-medium">{username}</span>
                            <button
                                onClick={handleLogout}
                                className="text-xs px-4 py-2 border border-lumera-border text-lumera-muted rounded hover:border-red-500/60 hover:text-red-400 transition-all duration-250"
                            >
                                Log Out
                            </button>
                        </div>
                    ) : (
                        <Link
                            to="/login"
                            className="text-xs px-5 py-2 border border-lumera-gold text-lumera-gold rounded hover:bg-lumera-gold hover:text-black transition-all duration-250 font-medium tracking-wide"
                        >
                            Sign In
                        </Link>
                    )}
                </div>

            </div>
        </nav>
    )
}
