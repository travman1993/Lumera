import { Outlet } from "react-router-dom"
import Navbar from "../components/Navbar"

export default function MainLayout() {
    return (
        // Makes layout at least full screen height, Stack children virtically.
        <div className="min-h-screen flex flex-col">
            {/* Nav stays fixed at top */}
            <Navbar />

            {/* Main grows filling space so footer stays at bottom */}
            <main className="flex-1">
                {/* Current page renders */}
                <Outlet />
            </main>
        </div>
    )
}