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
        <nav className="fixed top-0 w-full z-50 bg-lumera-dark border-b border-lumera-border">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

                <Link to="/" className="font-display text-2xl text-lumera-gold">Lumera</Link>

                <div className="flex items-center gap-6">
                    <Link to="/" className="text-sm text-lumera-muted hover:text-white transition-colors">Browse</Link>
                    <Link to="/" className="text-sm text-lumera-muted hover:text-white transition-colors">Creators</Link>

                    {/* Show username + logout if logged in, Sign In if not */}
                    {token && username ? (
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-lumera-gold">{username}</span>
                            <button
                                onClick={handleLogout}
                                className="text-sm px-4 py-2 border border-lumera-border text-lumera-muted rounded hover:border-red-500 hover:text-red-400 transition-all"
                            >
                                Log Out
                            </button>
                        </div>
                    ) : (
                        <Link
                            to="/login"
                            className="text-sm px-4 py-2 border border-lumera-gold text-lumera-gold rounded hover:bg-lumera-gold hover:text-black transition-all"
                        >
                            Sign In
                        </Link>
                    )}
                </div>

            </div>
        </nav>
    )
}
