/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'savage-dark': '#0a0a0a',
                'savage-panel': '#111111',
                'savage-border': '#222222',
                'savage-accent': '#3b82f6',
                'savage-text': '#e5e5e5',
                'savage-muted': '#a3a3a3',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
