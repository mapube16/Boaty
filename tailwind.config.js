/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#0A192F", // Deep Navy
                secondary: "#112240", // Navy
                accent: "#64FFDA", // Cyan/Turquoise
                "light-slate": "#a8b2d1",
                slate: "#8892b0",
                white: "#e6f1ff",
            },
            fontFamily: {
                sans: ["Inter", "sans-serif"],
            },
            backgroundImage: {
                'hero-pattern': "url('/hero-bg.jpg')",
            },
        },
    },
    plugins: [],
}
