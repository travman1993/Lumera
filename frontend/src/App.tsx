import { Routes, Route } from "react-router-dom"
import MainLayout from "./layouts/MainLayout"
import Home from "./pages/Home"
import NotFound from "./pages/NotFound"

export default function App() {
    return (
        // Routes look at current URL and matches
        <Routes>
            {/* MainLyout wraps all pages that need nav and footer, nested rou0tes handle actual page */}
            <Route element={<MainLayout />}>
                {/* this loads at "/", home pages */}
                <Route index element={<Home />} />
                {/* catches any URL that didnt match above */}
                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes>
    )
}