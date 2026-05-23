/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{ts,tsx}"],

    theme: {
        extend: {
            colors: {
                lumera: {
                    dark: "#0a0a0f",        // main page background (near black)
                    surface: "#111118",     // card and panel backgrounds
                    border: "#1f1f2e",      // subtle divider lines
                    gold: "#c9a84c",        // primary accent color
                    "gold-light": "#e8c96a",// hover state for gold
                    muted: "#6b6b80",       // secondary / dimmed text
                },
            },
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
                display: ["DM Serif Display", "serif"],
            },
        },
    },
    plugins: [],
}