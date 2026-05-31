import { useState, useEffect, useCallback } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Flag, Users, Film, BarChart2, CheckCircle, XCircle, EyeOff, Trash2, RotateCcw, Ban, Search } from "lucide-react"
import {
  type AdminStats,
  type AdminReport,
  type AdminUser,
  type AdminFilm,
  getCurrentUser,
  getAdminStats,
  getAdminReports,
  updateAdminReport,
  getAdminUsers,
  suspendUser,
  restoreUser,
  getAdminFilms,
  adminUnpublishFilm,
  adminDeleteFilm,
  getToken,
} from "../services/api"

type Tab = "reports" | "users" | "films"

const STATUS_COLORS: Record<string, string> = {
  pending:   "bg-amber-500/15 text-amber-400",
  reviewing: "bg-blue-500/15 text-blue-400",
  resolved:  "bg-green-500/15 text-green-400",
  dismissed: "bg-lumera-border text-lumera-muted",
}

export default function Admin() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>("reports")
  const [stats, setStats] = useState<AdminStats | null>(null)

  const [reports, setReports]     = useState<AdminReport[]>([])
  const [reportFilter, setReportFilter] = useState("pending")

  const [users, setUsers]         = useState<AdminUser[]>([])
  const [userSearch, setUserSearch] = useState("")

  const [films, setFilms]         = useState<AdminFilm[]>([])

  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState("")

  // Guard: must be admin
  useEffect(() => {
    if (!getToken()) { navigate("/login"); return }
    getCurrentUser().then((u) => {
      // @ts-ignore — is_admin not in UserResponse type yet; backend returns it
      if (!u.is_admin) navigate("/")
    }).catch(() => navigate("/login"))
  }, [navigate])

  const loadStats = useCallback(async () => {
    try { setStats(await getAdminStats()) } catch { /* silent */ }
  }, [])

  const loadReports = useCallback(async () => {
    setLoading(true)
    try { setReports(await getAdminReports(reportFilter || undefined)) }
    catch (e) { setError(e instanceof Error ? e.message : "Failed to load reports") }
    finally { setLoading(false) }
  }, [reportFilter])

  const loadUsers = useCallback(async () => {
    setLoading(true)
    try { setUsers(await getAdminUsers(userSearch || undefined)) }
    catch (e) { setError(e instanceof Error ? e.message : "Failed to load users") }
    finally { setLoading(false) }
  }, [userSearch])

  const loadFilms = useCallback(async () => {
    setLoading(true)
    try { setFilms(await getAdminFilms()) }
    catch (e) { setError(e instanceof Error ? e.message : "Failed to load films") }
    finally { setLoading(false) }
  }, [])

  // Load on tab switch
  useEffect(() => { loadStats() }, [loadStats])
  useEffect(() => { if (tab === "reports") loadReports() }, [tab, loadReports])
  useEffect(() => { if (tab === "users")   loadUsers()   }, [tab, loadUsers])
  useEffect(() => { if (tab === "films")   loadFilms()   }, [tab, loadFilms])

  // ── Actions ──────────────────────────────────────────────────────────────

  const resolveReport = async (id: string, action: "resolved" | "dismissed", actionTaken?: string) => {
    await updateAdminReport(id, action, actionTaken)
    setReports((prev) => prev.map((r) => r.id === id ? { ...r, status: action, action_taken: actionTaken ?? null } : r))
    loadStats()
  }

  const handleSuspend = async (user: AdminUser) => {
    const reason = window.prompt(`Reason for suspending @${user.username}:`)
    if (!reason) return
    await suspendUser(user.id, reason)
    setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, is_active: false } : u))
  }

  const handleRestore = async (userId: string) => {
    await restoreUser(userId)
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, is_active: true } : u))
  }

  const handleUnpublish = async (filmId: string) => {
    await adminUnpublishFilm(filmId)
    setFilms((prev) => prev.map((f) => f.id === filmId ? { ...f, visibility: "draft", is_published: false } : f))
  }

  const handleDeleteFilm = async (filmId: string, title: string) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return
    await adminDeleteFilm(filmId)
    setFilms((prev) => prev.filter((f) => f.id !== filmId))
  }

  // ── Shared styles ─────────────────────────────────────────────────────────

  const cellClass = "px-4 py-3 text-sm"
  const thClass   = "px-4 py-2 text-left text-2xs uppercase tracking-wider text-lumera-muted font-medium"

  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-10">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl text-white">Admin</h1>
            <p className="text-lumera-muted text-sm mt-1">Moderation dashboard</p>
          </div>
          <Link to="/" className="text-lumera-muted text-sm hover:text-white transition-colors">
            ← Back to site
          </Link>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {/* ── Stats ── */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              { label: "Pending Film Reports", value: stats.pending_film_reports, urgent: stats.pending_film_reports > 0 },
              { label: "Pending User Reports", value: stats.pending_user_reports, urgent: stats.pending_user_reports > 0 },
              { label: "Total Users",          value: stats.total_users,          urgent: false },
              { label: "Public Films",         value: stats.total_public_films,   urgent: false },
            ].map((s) => (
              <div key={s.label} className={`bg-lumera-surface border rounded-xl p-4 text-center ${s.urgent ? "border-amber-500/40" : "border-lumera-border"}`}>
                <p className={`text-2xl font-bold ${s.urgent ? "text-amber-400" : "text-white"}`}>{s.value}</p>
                <p className="text-lumera-muted text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Tabs ── */}
        <div className="flex gap-1 mb-6 bg-lumera-surface border border-lumera-border rounded-lg p-1 w-fit">
          {([
            { id: "reports" as Tab, label: "Reports",  icon: <Flag size={13} />,     badge: stats?.pending_film_reports },
            { id: "users"   as Tab, label: "Users",    icon: <Users size={13} /> },
            { id: "films"   as Tab, label: "Films",    icon: <Film size={13} /> },
          ]).map((t) => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setError("") }}
              className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-all ${
                tab === t.id
                  ? "bg-lumera-gold text-black"
                  : "text-lumera-muted hover:text-white"
              }`}
            >
              {t.icon}
              {t.label}
              {t.badge != null && t.badge > 0 && (
                <span className="ml-0.5 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center leading-none">
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Reports tab ── */}
        {tab === "reports" && (
          <div className="bg-lumera-surface border border-lumera-border rounded-xl overflow-hidden">
            <div className="flex items-center gap-3 p-4 border-b border-lumera-border">
              <span className="text-lumera-muted text-sm">Filter:</span>
              {["pending", "reviewing", "resolved", "dismissed", ""].map((s) => (
                <button
                  key={s || "all"}
                  onClick={() => setReportFilter(s)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    reportFilter === s
                      ? "bg-lumera-gold text-black"
                      : "text-lumera-muted hover:text-white border border-lumera-border"
                  }`}
                >
                  {s || "All"}
                </button>
              ))}
            </div>

            {loading ? (
              <p className="text-lumera-muted text-sm p-6">Loading…</p>
            ) : reports.length === 0 ? (
              <p className="text-lumera-muted text-sm p-6">No reports.</p>
            ) : (
              <table className="w-full">
                <thead className="border-b border-lumera-border bg-lumera-dark/40">
                  <tr>
                    <th className={thClass}>Film</th>
                    <th className={thClass}>Reason</th>
                    <th className={thClass}>Details</th>
                    <th className={thClass}>Status</th>
                    <th className={thClass}>Date</th>
                    <th className={thClass}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-lumera-border">
                  {reports.map((r) => (
                    <tr key={r.id} className="hover:bg-lumera-dark/30 transition-colors">
                      <td className={cellClass}>
                        <Link to={`/film/${r.film_id}`} target="_blank" className="text-lumera-gold hover:underline text-xs font-mono">
                          {r.film_id.slice(0, 8)}…
                        </Link>
                      </td>
                      <td className={cellClass}>
                        <span className="text-white text-xs">{r.reason}</span>
                      </td>
                      <td className={`${cellClass} text-lumera-muted text-xs max-w-[200px] truncate`}>
                        {r.details || "—"}
                      </td>
                      <td className={cellClass}>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[r.status] ?? STATUS_COLORS.dismissed}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className={`${cellClass} text-lumera-muted text-xs whitespace-nowrap`}>
                        {new Date(r.created_at).toLocaleDateString()}
                      </td>
                      <td className={cellClass}>
                        {r.status === "pending" || r.status === "reviewing" ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => resolveReport(r.id, "resolved", "content_removed")}
                              title="Resolve"
                              className="text-green-400 hover:text-green-300 transition-colors"
                            >
                              <CheckCircle size={15} />
                            </button>
                            <button
                              onClick={() => resolveReport(r.id, "dismissed", "no_action")}
                              title="Dismiss"
                              className="text-lumera-muted hover:text-white transition-colors"
                            >
                              <XCircle size={15} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-lumera-muted text-xs">{r.action_taken ?? "—"}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── Users tab ── */}
        {tab === "users" && (
          <div className="bg-lumera-surface border border-lumera-border rounded-xl overflow-hidden">
            <div className="flex items-center gap-3 p-4 border-b border-lumera-border">
              <Search size={14} className="text-lumera-muted flex-shrink-0" />
              <input
                type="text"
                placeholder="Search by username or email…"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loadUsers()}
                className="bg-transparent text-sm text-white placeholder:text-lumera-muted/50 focus:outline-none flex-1"
              />
              <button
                onClick={loadUsers}
                className="text-xs text-lumera-gold hover:underline flex-shrink-0"
              >
                Search
              </button>
            </div>

            {loading ? (
              <p className="text-lumera-muted text-sm p-6">Loading…</p>
            ) : users.length === 0 ? (
              <p className="text-lumera-muted text-sm p-6">No users found.</p>
            ) : (
              <table className="w-full">
                <thead className="border-b border-lumera-border bg-lumera-dark/40">
                  <tr>
                    <th className={thClass}>User</th>
                    <th className={thClass}>Status</th>
                    <th className={thClass}>Flags</th>
                    <th className={thClass}>Joined</th>
                    <th className={thClass}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-lumera-border">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-lumera-dark/30 transition-colors">
                      <td className={cellClass}>
                        <p className="text-white text-sm font-medium">@{u.username}</p>
                        <p className="text-lumera-muted text-xs">{u.email}</p>
                      </td>
                      <td className={cellClass}>
                        <div className="flex flex-col gap-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full w-fit ${u.is_active ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}>
                            {u.is_active ? "Active" : "Suspended"}
                          </span>
                          {!u.is_verified && (
                            <span className="text-xs text-amber-400/70">Unverified</span>
                          )}
                        </div>
                      </td>
                      <td className={cellClass}>
                        <div className="flex flex-wrap gap-1">
                          {u.is_admin    && <span className="text-xs px-1.5 py-0.5 rounded bg-lumera-gold/20 text-lumera-gold">admin</span>}
                          {u.is_creator  && <span className="text-xs px-1.5 py-0.5 rounded bg-lumera-border text-lumera-muted">creator</span>}
                          {u.copyright_strikes > 0 && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">{u.copyright_strikes} strikes</span>
                          )}
                        </div>
                      </td>
                      <td className={`${cellClass} text-lumera-muted text-xs whitespace-nowrap`}>
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className={cellClass}>
                        {!u.is_admin && (
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/creator/${u.id}`}
                              target="_blank"
                              className="text-lumera-muted hover:text-white transition-colors text-xs"
                            >
                              View
                            </Link>
                            {u.is_active ? (
                              <button
                                onClick={() => handleSuspend(u)}
                                title="Suspend"
                                className="text-amber-400 hover:text-amber-300 transition-colors"
                              >
                                <Ban size={14} />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleRestore(u.id)}
                                title="Restore"
                                className="text-green-400 hover:text-green-300 transition-colors"
                              >
                                <RotateCcw size={14} />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── Films tab ── */}
        {tab === "films" && (
          <div className="bg-lumera-surface border border-lumera-border rounded-xl overflow-hidden">
            {loading ? (
              <p className="text-lumera-muted text-sm p-6">Loading…</p>
            ) : films.length === 0 ? (
              <p className="text-lumera-muted text-sm p-6">No films.</p>
            ) : (
              <table className="w-full">
                <thead className="border-b border-lumera-border bg-lumera-dark/40">
                  <tr>
                    <th className={thClass}>Title</th>
                    <th className={thClass}>Visibility</th>
                    <th className={thClass}>Views</th>
                    <th className={thClass}>Likes</th>
                    <th className={thClass}>Created</th>
                    <th className={thClass}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-lumera-border">
                  {films.map((f) => (
                    <tr key={f.id} className="hover:bg-lumera-dark/30 transition-colors">
                      <td className={cellClass}>
                        <Link to={`/film/${f.id}`} target="_blank" className="text-white hover:text-lumera-gold text-sm transition-colors">
                          {f.title}
                        </Link>
                      </td>
                      <td className={cellClass}>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          f.visibility === "public"   ? "bg-green-500/15 text-green-400" :
                          f.visibility === "unlisted" ? "bg-blue-500/15 text-blue-400"  :
                                                        "bg-lumera-border text-lumera-muted"
                        }`}>
                          {f.visibility}
                        </span>
                      </td>
                      <td className={`${cellClass} text-lumera-muted text-sm`}>{f.views.toLocaleString()}</td>
                      <td className={`${cellClass} text-lumera-muted text-sm`}>{f.likes_count.toLocaleString()}</td>
                      <td className={`${cellClass} text-lumera-muted text-xs whitespace-nowrap`}>
                        {new Date(f.created_at).toLocaleDateString()}
                      </td>
                      <td className={cellClass}>
                        <div className="flex items-center gap-2">
                          {f.visibility === "public" && (
                            <button
                              onClick={() => handleUnpublish(f.id)}
                              title="Unpublish"
                              className="text-amber-400 hover:text-amber-300 transition-colors"
                            >
                              <EyeOff size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteFilm(f.id, f.title)}
                            title="Delete"
                            className="text-lumera-muted hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
