import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { loginUser, saveToken, getCurrentUser, saveUsername } from "../services/api"

export default function Login() {
    const navigate = useNavigate()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const token = await loginUser({ email, password })
            saveToken(token.access_token)

            // Fetch user info and save username for the navbar
            const user = await getCurrentUser()
            saveUsername(user.username)

            navigate("/")
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-6">
            <div className="w-full max-w-md bg-lumera-surface border border-lumera-border rounded-xl p-8">

                <h1 className="font-display text-3xl text-lumera-gold mb-2 text-center">Lumera</h1>
                <p className="text-lumera-muted text-sm text-center mb-8">
                    Sign in to your account
                </p>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm rounded px-4 py-3 mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-lumera-muted">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="bg-lumera-dark border border-lumera-border rounded px-4 py-3 text-white text-sm focus:outline-none focus:border-lumera-gold"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-lumera-muted">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="bg-lumera-dark border border-lumera-border rounded px-4 py-3 text-white text-sm focus:outline-none focus:border-lumera-gold"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-lumera-gold text-black font-semibold rounded hover:bg-lumera-gold-light transition-all disabled:opacity-50"
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <p className="text-lumera-muted text-sm text-center mt-6">
                    Don't have an account?{" "}
                    <Link to="/register" className="text-lumera-gold hover:underline">Create One</Link>
                </p>
            </div>
        </div>
    )
}
