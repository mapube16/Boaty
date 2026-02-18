/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                navy: {
                    dark: "#081b33", // Even deeper navy
                    DEFAULT: "#1b3c6c",
                    light: "#2a528a",
                },
                orange: {
                    light: "#ff8c5a",
                    DEFAULT: "#f26a31",
                    dark: "#d14d1a",
                },
                cream: {
                    light: "#f7f5f2",
                    DEFAULT: "#eeeae6",
                    dark: "#d9d2cb",
                },
                gold: "#c5a059", // For subtle premium accents
            },
            fontFamily: {
                sans: ["Inter", "sans-serif"],
                heading: ["Outfit", "sans-serif"],
            },
            boxShadow: {
                'premium': '0 20px 50px rgba(8, 27, 51, 0.15)',
                'premium-orange': '0 10px 30px rgba(242, 106, 49, 0.3)',
            },
            letterSpacing: {
                tightest: '-0.05em',
                widest: '0.25em',
            },
        },
    },
    plugins: [],
}
