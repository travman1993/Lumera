import { useState } from "react"
import { Link } from "react-router-dom"
import { Mail } from "lucide-react"
import { resendVerification, getToken } from "../services/api"

export default function VerifyEmailSent() {
  const [resent, setResent] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleResend = async () => {
    if (!getToken()) return
    setLoading(true)
    setError("")
    try {
      await resendVerification()
      setResent(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not resend verification email.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-lumera-surface border border-lumera-border rounded-xl p-8 text-center">

        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 rounded-full bg-lumera-gold/10 border border-lumera-gold/30 flex items-center justify-center">
            <Mail size={24} className="text-lumera-gold" />
          </div>
        </div>

        <h1 className="font-display text-2xl text-white mb-2">Check your inbox</h1>
        <p className="text-lumera-muted text-sm leading-relaxed mb-6">
          We sent a verification link to your email address. Click it to activate your account and
          start uploading films.
        </p>

        <p className="text-lumera-muted/60 text-xs mb-6">
          The link expires in 24 hours. Check your spam folder if you don't see it.
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm rounded px-4 py-3 mb-4">
            {error}
          </div>
        )}

        {resent ? (
          <p className="text-green-400 text-sm mb-4">Verification email resent.</p>
        ) : (
          <button
            onClick={handleResend}
            disabled={loading || !getToken()}
            className="text-lumera-gold text-sm hover:underline disabled:opacity-40 disabled:no-underline mb-4 block mx-auto"
          >
            {loading ? "Resending…" : "Resend verification email"}
          </button>
        )}

        <Link to="/" className="text-lumera-muted text-sm hover:text-white transition-colors">
          Return to home
        </Link>

      </div>
    </div>
  )
}
