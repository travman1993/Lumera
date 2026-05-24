import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { registerUser } from "../services/api"

export default function Register() {
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await registerUser({ email, username, password })
      // After successful registration, send them to login
      navigate("/login")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-lumera-surface border border-lumera-border rounded-xl p-8">

        <h1 className="font-display text-3xl text-lumera-gold mb-2 text-center">
          Lumera
        </h1>
        <p className="text-lumera-muted text-sm text-center mb-8">
          Create your account
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
            <label className="text-sm text-lumera-muted">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
            {loading ? "Creating account..." : "Create Account"}
          </button>

        </form>

        <p className="text-lumera-muted text-sm text-center mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-lumera-gold hover:underline">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  )
}
