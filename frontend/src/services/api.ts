const BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000"

// ─── Auth types ────────────────────────────────────────────────────────────

export interface RegisterData {
  email: string
  username: string
  password: string
  age_confirmed: boolean
  tos_accepted: boolean
}

export interface LoginData {
  email: string
  password: string
}

export interface UserResponse {
  id: string
  email: string
  username: string
  is_verified: boolean
  is_active: boolean
  is_creator: boolean
  created_at: string
}

export interface Token {
  access_token: string
  token_type: string
}

// ─── Content types ─────────────────────────────────────────────────────────

export interface Category {
  id: string
  name: string
  slug: string
}

export interface Contributor {
  name: string
  role: string
  social?: string
}

export type FilmVisibility = "draft" | "unlisted" | "public"

export interface Film {
  id: string
  title: string
  slug: string
  description?: string
  production_story?: string
  category_id: string
  category_name: string
  creator_id: string
  creator_username: string
  creator_display_name?: string
  thumbnail_url?: string
  cover_url?: string
  video_url?: string
  duration?: string
  budget?: string
  gear_used?: string
  contributors: Contributor[]
  views: number
  likes_count: number
  featured: boolean
  visibility: FilmVisibility
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface Award {
  title: string
  festival: string
  year: string
}

export interface CreatorPublic {
  user_id: string
  username: string
  display_name?: string
  bio?: string
  avatar_url?: string
  instagram?: string
  youtube?: string
  website?: string
  location?: string
  gear?: string
  awards?: Award[]
  films: Film[]
}

export interface CreatorProfileUpdate {
  display_name: string
  bio?: string
  avatar_url?: string
  instagram?: string
  youtube?: string
  website?: string
  location?: string
  gear?: string
  awards?: Award[]
}

// ─── Token helpers ──────────────────────────────────────────────────────────

export function saveToken(token: string) {
  localStorage.setItem("lumera_token", token)
}

export function getToken(): string | null {
  return localStorage.getItem("lumera_token")
}

export function removeToken() {
  localStorage.removeItem("lumera_token")
}

export function saveUsername(username: string) {
  localStorage.setItem("lumera_username", username)
}

export function getUsername(): string | null {
  return localStorage.getItem("lumera_username")
}

export function removeUsername() {
  localStorage.removeItem("lumera_username")
}

// ─── Auth requests ──────────────────────────────────────────────────────────

export async function registerUser(data: RegisterData): Promise<UserResponse> {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json()
    // Pydantic validation errors come back as an array; flatten to a single message
    if (Array.isArray(err.detail)) {
      const msg = err.detail.map((e: { msg: string }) => e.msg).join(" ")
      throw new Error(msg)
    }
    throw new Error(err.detail || "Registration failed")
  }
  return res.json()
}

export async function loginUser(data: LoginData): Promise<Token> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || "Login failed")
  }
  return res.json()
}

export async function getCurrentUser(): Promise<UserResponse> {
  const res = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  })
  if (!res.ok) throw new Error("Not authenticated")
  return res.json()
}

export async function resendVerification(): Promise<void> {
  const res = await fetch(`${BASE_URL}/auth/resend-verification`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` },
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || "Failed to resend verification email")
  }
}

// ─── Category requests ──────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${BASE_URL}/categories`)
  if (!res.ok) throw new Error("Failed to load categories")
  return res.json()
}

// ─── Film requests ──────────────────────────────────────────────────────────

export async function getFilms(): Promise<Film[]> {
  const res = await fetch(`${BASE_URL}/films`)
  if (!res.ok) throw new Error("Failed to load films")
  return res.json()
}

export async function getFilmsByCategory(slug: string, limit?: number): Promise<Film[]> {
  const url = limit
    ? `${BASE_URL}/films/category/${slug}?limit=${limit}`
    : `${BASE_URL}/films/category/${slug}`
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to load films")
  return res.json()
}

export async function getFilmById(id: string): Promise<Film> {
  const res = await fetch(`${BASE_URL}/films/${id}`)
  if (!res.ok) throw new Error("Film not found")
  return res.json()
}

export async function likeFilm(id: string): Promise<{ likes_count: number; liked: boolean }> {
  const token = getToken()
  if (!token) throw new Error("You must be logged in to like a film.")
  const res = await fetch(`${BASE_URL}/films/${id}/like`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || "Failed to like film")
  }
  return res.json()
}

export async function reportFilm(id: string, reason: string, details?: string): Promise<void> {
  const token = getToken()
  if (!token) throw new Error("You must be logged in to submit a report.")
  const body = new FormData()
  body.append("reason", reason)
  if (details) body.append("details", details)
  const res = await fetch(`${BASE_URL}/films/${id}/report`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body,
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || "Failed to submit report")
  }
}

export async function reportUser(userId: string, reason: string, details?: string): Promise<void> {
  const token = getToken()
  if (!token) throw new Error("You must be logged in to submit a report.")
  const body = new FormData()
  body.append("reason", reason)
  if (details) body.append("details", details)
  const res = await fetch(`${BASE_URL}/creators/${userId}/report`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body,
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || "Failed to submit report")
  }
}

export async function uploadFilm(formData: FormData): Promise<Film> {
  const res = await fetch(`${BASE_URL}/films`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData,
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || "Upload failed")
  }
  return res.json()
}

export async function updateFilm(id: string, data: Partial<Film>): Promise<Film> {
  const res = await fetch(`${BASE_URL}/films/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || "Update failed")
  }
  return res.json()
}

export async function deleteFilm(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/films/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${getToken()}` },
  })
  if (!res.ok) throw new Error("Delete failed")
}

// ─── Creator requests ───────────────────────────────────────────────────────

export async function uploadAvatar(file: File): Promise<{ avatar_url: string }> {
  const formData = new FormData()
  formData.append("avatar", file)
  const res = await fetch(`${BASE_URL}/creators/me/avatar`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData,
  })
  if (!res.ok) throw new Error("Failed to upload avatar")
  return res.json()
}

export async function getMyFilms(): Promise<Film[]> {
  const res = await fetch(`${BASE_URL}/films/mine`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  })
  if (!res.ok) throw new Error("Failed to load your films")
  return res.json()
}

export async function getCreator(userId: string): Promise<CreatorPublic> {
  const res = await fetch(`${BASE_URL}/creators/${userId}`)
  if (!res.ok) throw new Error("Creator not found")
  return res.json()
}

export async function updateCreatorProfile(data: CreatorProfileUpdate): Promise<CreatorPublic> {
  const res = await fetch(`${BASE_URL}/creators/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || "Profile update failed")
  }
  return res.json()
}
