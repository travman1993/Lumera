import { Routes, Route } from "react-router-dom"
import MainLayout from "./layouts/MainLayout"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import FilmDetail from "./pages/FilmDetail"
import CreatorProfile from "./pages/CreatorProfile"
import CategoryPage from "./pages/CategoryPage"
import Upload from "./pages/Upload"
import Dashboard from "./pages/Dashboard"
import NotFound from "./pages/NotFound"
import VerifyEmailSent from "./pages/VerifyEmailSent"
import VerifyEmail from "./pages/VerifyEmail"
import TermsOfService from "./pages/legal/TermsOfService"
import PrivacyPolicy from "./pages/legal/PrivacyPolicy"
import CreatorGuidelines from "./pages/legal/CreatorGuidelines"
import DMCA from "./pages/legal/DMCA"
import Admin from "./pages/Admin"

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email-sent" element={<VerifyEmailSent />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/film/:id" element={<FilmDetail />} />
        <Route path="/creator/:id" element={<CreatorProfile />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/upload/:id" element={<Upload />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/legal/terms" element={<TermsOfService />} />
        <Route path="/legal/privacy" element={<PrivacyPolicy />} />
        <Route path="/legal/guidelines" element={<CreatorGuidelines />} />
        <Route path="/legal/dmca" element={<DMCA />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
