import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import App from "./App"
import "./styles/index.css"

// Finds div id="root" and mounts React into it.
ReactDOM.createRoot(document.getElementById("root")!).render(
    // Strict mode for catching bugs early.
    <React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>
)