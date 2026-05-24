const BASE_URL = "http://127.0.0.1:8000"

// Types
export interface RegisterData {
    email: string
    username: string
    password: string
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
created_at: string
}

export interface Token {
access_token: string
token_type: string
}

// HELPERS 
export function saveToken(token: string) {
localStorage.setItem("lumera_token", token)
}

// Retrieves the saved token
export function getToken(): string | null {
return localStorage.getItem("lumera_token")
}

// Removes the token
export function removeToken() {
localStorage.removeItem("lumera_token")
}

// AUTH REQUESTS

export async function registerUser(data: RegisterData): Promise<UserResponse> {
const response = await fetch(`${BASE_URL}/auth/register`, {
method: "POST",
// Tell the backend we're sending JSON
headers: { "Content-Type": "application/json" },
body: JSON.stringify(data),
})

// If the server returned an error, extract the message and throw it
if (!response.ok) {
const error = await response.json()
throw new Error(error.detail || "Registration failed")
}

return response.json()
}

export async function loginUser(data: LoginData): Promise<Token> {
const response = await fetch(`${BASE_URL}/auth/login`, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify(data),
})

if (!response.ok) {
const error = await response.json()
throw new Error(error.detail || "Login failed")
}

return response.json()
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

export async function getCurrentUser(): Promise<UserResponse> {
  const token = getToken()
  const response = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) throw new Error("Not authenticated")
  return response.json()
}