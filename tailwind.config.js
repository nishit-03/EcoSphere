/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./App.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                // Nature-inspired palette
                primary: '#06b6d4', // cyan-500
                secondary: '#10b981', // emerald-500
                accent: '#3b82f6', // blue-500
            }
        },
    },
    plugins: [],
}
