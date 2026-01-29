/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#E63946', // Red for blood
                secondary: '#F1FAEE', // White/Off-white
                accent: '#457B9D', // Blue
                dark: '#1D3557', // Dark Blue
            }
        },
    },
    plugins: [],
}
