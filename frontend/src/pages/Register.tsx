import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { registerUser } from "../services/api"

export default function Register() {
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [ageConfirmed, setAgeConfirmed] = useState(false)
  const [tosAccepted, setTosAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!ageConfirmed) {
      setError("You must confirm that you are at least 13 years of age.")
      return
    }
    if (!tosAccepted) {
      setError("You must accept the Terms of Service to create an account.")
      return
    }

    setLoading(true)
    try {
      await registerUser({
        email,
        username,
        password,
        age_confirmed: ageConfirmed,
        tos_accepted: tosAccepted,
      })
      navigate("/verify-email-sent")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    "w-full bg-lumera-dark border border-lumera-border rounded px-4 py-3 text-white text-sm focus:outline-none focus:border-lumera-gold transition-colors"

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md bg-lumera-surface border border-lumera-border rounded-xl p-8">

        <h1 className="font-display text-3xl text-lumera-gold mb-2 text-center">Lumera</h1>
        <p className="text-lumera-muted text-sm text-center mb-8">Create your account</p>

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
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-lumera-muted">
              Username
              <span className="text-lumera-muted/50 ml-1 text-xs">(3–30 chars, letters/numbers/_.-)</span>
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              maxLength={30}
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-lumera-muted">
              Password
              <span className="text-lumera-muted/50 ml-1 text-xs">(min 8 characters)</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className={inputClass}
            />
          </div>

          {/* ── Legal acknowledgements ── */}
          <div className="flex flex-col gap-3 pt-1">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={ageConfirmed}
                onChange={(e) => setAgeConfirmed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-lumera-border accent-lumera-gold flex-shrink-0 cursor-pointer"
              />
              <span className="text-sm text-lumera-muted group-hover:text-lumera-text transition-colors leading-snug">
                I confirm that I am at least 13 years of age.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={tosAccepted}
                onChange={(e) => setTosAccepted(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-lumera-border accent-lumera-gold flex-shrink-0 cursor-pointer"
              />
              <span className="text-sm text-lumera-muted group-hover:text-lumera-text transition-colors leading-snug">
                I agree to Lumera's{" "}
                <Link to="/legal/terms" target="_blank" className="text-lumera-gold hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/legal/privacy" target="_blank" className="text-lumera-gold hover:underline">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-lumera-gold text-black font-semibold rounded hover:bg-lumera-gold-light transition-all disabled:opacity-50 mt-1"
          >
            {loading ? "Creating account…" : "Create Account"}
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
