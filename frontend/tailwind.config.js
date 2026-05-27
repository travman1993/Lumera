/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{ts,tsx}"],

    theme: {
        extend: {
            colors: {
                lumera: {
                    dark: "#0a0a0f",           // page background
                    surface: "#111118",         // card/panel backgrounds
                    "surface-raised": "#16161f", // elevated surfaces (modals, dropdowns)
                    border: "#1f1f2e",          // dividers, card borders
                    "border-subtle": "#2a2a3d", // highlighted border on hover
                    gold: "#c9a84c",            // primary accent
                    "gold-light": "#e8c96a",    // gold hover
                    "gold-dim": "#8b6f2e",      // subtle/inactive gold
                    muted: "#6b6b80",           // secondary text
                    "muted-light": "#9090a8",   // slightly brighter secondary text
                    text: "#e2e2ec",            // body text (slightly off-white, easier to read)
                },
            },
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
                display: ["DM Serif Display", "Georgia", "serif"],
            },
            fontSize: {
                "2xs": ["0.625rem", { lineHeight: "1rem", letterSpacing: "0.05em" }],
            },
            letterSpacing: {
                "film": "0.18em",  // for uppercase category/label overlines
            },
            boxShadow: {
                "card": "0 4px 32px rgba(0, 0, 0, 0.45)",
                "card-hover": "0 8px 40px rgba(0, 0, 0, 0.6)",
                "gold-glow": "0 0 24px rgba(201, 168, 76, 0.12)",
            },
            transitionDuration: {
                "250": "250ms",
            },
            backgroundImage: {
                "gradient-hero": "linear-gradient(to top, #0a0a0f 0%, rgba(10,10,15,0.55) 50%, transparent 100%)",
                "gradient-card": "linear-gradient(to top, rgba(10,10,15,0.9) 0%, transparent 60%)",
            },
        },
    },
    plugins: [],
}
