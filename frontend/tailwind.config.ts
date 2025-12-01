import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // Brand colors
                primary: {
                    50: "#f0f9ff",
                    100: "#e0f2fe",
                    200: "#bae6fd",
                    300: "#7dd3fc",
                    400: "#38bdf8",
                    500: "#0ea5e9",
                    600: "#0284c7",
                    700: "#0369a1",
                    800: "#075985",
                    900: "#0c4a6e",
                    950: "#082f49",
                },
                // YES/NO outcome colors
                yes: {
                    light: "#10b981",
                    DEFAULT: "#059669",
                    dark: "#047857",
                },
                no: {
                    light: "#f43f5e",
                    DEFAULT: "#e11d48",
                    dark: "#be123c",
                },
                // Dark mode
                dark: {
                    bg: "#0a0f1a",
                    card: "#111827",
                    border: "#1f2937",
                    text: "#f9fafb",
                    muted: "#9ca3af",
                },
            },
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
                display: ["Outfit", "Inter", "sans-serif"],
            },
            boxShadow: {
                glow: "0 0 20px rgba(14, 165, 233, 0.3)",
                "glow-yes": "0 0 20px rgba(16, 185, 129, 0.3)",
                "glow-no": "0 0 20px rgba(244, 63, 94, 0.3)",
            },
            animation: {
                "fade-in": "fadeIn 0.3s ease-in-out",
                "slide-up": "slideUp 0.4s ease-out",
                "slide-down": "slideDown 0.4s ease-out",
                pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                slideUp: {
                    "0%": { transform: "translateY(20px)", opacity: "0" },
                    "100%": { transform: "translateY(0)", opacity: "1" },
                },
                slideDown: {
                    "0%": { transform: "translateY(-20px)", opacity: "0" },
                    "100%": { transform: "translateY(0)", opacity: "1" },
                },
            },
            screens: {
                xs: "475px",
            },
        },
    },
    plugins: [],
    darkMode: "class",
};

export default config;
