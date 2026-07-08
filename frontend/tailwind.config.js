/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: "#080c14",
          card: "rgba(13, 20, 35, 0.65)",
          border: "rgba(30, 41, 59, 0.5)",
          primary: "#0284c7",   // Neon Sky Blue
          secondary: "#0d9488", // Cyber Teal
          accent: "#ef4444",    // Cyber Alert Red (Stego)
          safe: "#10b981",      // Secure Green (Cover)
          muted: "#64748b",     // Slate text
          light: "#f8fafc",     // Off white
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'Outfit', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'neon-blue': '0 0 15px rgba(2, 132, 199, 0.4)',
        'neon-red': '0 0 15px rgba(239, 68, 68, 0.4)',
        'neon-green': '0 0 15px rgba(16, 185, 129, 0.4)',
      }
    },
  },
  plugins: [],
}
