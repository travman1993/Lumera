import { useEffect, useState } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { CheckCircle, XCircle } from "lucide-react"

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000"

export default function VerifyEmail() {
  const [params] = useSearchParams()
  const token = params.get("token")

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("Missing verification token. Please use the link from your email.")
      return
    }

    fetch(`${BASE_URL}/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json()
        if (res.ok) {
          setStatus("success")
          setMessage(data.message || "Email verified successfully.")
        } else {
          setStatus("error")
          setMessage(data.detail || "Verification failed.")
        }
      })
      .catch(() => {
        setStatus("error")
        setMessage("Could not reach the server. Please try again.")
      })
  }, [token])

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-lumera-surface border border-lumera-border rounded-xl p-8 text-center">

        {status === "loading" && (
          <p className="text-lumera-muted text-sm">Verifying your email…</p>
        )}

        {status === "success" && (
          <>
            <div className="flex justify-center mb-5">
              <CheckCircle size={48} className="text-green-400" strokeWidth={1.5} />
            </div>
            <h1 className="font-display text-2xl text-white mb-2">Email verified</h1>
            <p className="text-lumera-muted text-sm mb-6">{message}</p>
            <Link
              to="/login"
              className="inline-block px-6 py-2.5 bg-lumera-gold text-black text-sm font-semibold rounded hover:bg-lumera-gold-light transition-all"
            >
              Sign in
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="flex justify-center mb-5">
              <XCircle size={48} className="text-red-400" strokeWidth={1.5} />
            </div>
            <h1 className="font-display text-2xl text-white mb-2">Verification failed</h1>
            <p className="text-lumera-muted text-sm mb-6">{message}</p>
            <Link
              to="/verify-email-sent"
              className="text-lumera-gold text-sm hover:underline"
            >
              Request a new verification link
            </Link>
          </>
        )}

      </div>
    </div>
  )
}
