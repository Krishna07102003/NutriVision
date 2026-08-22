/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Surface colors (dark)
        surface: {
          base: 'var(--bg-base)',
          card: 'var(--bg-card)',
          border: 'var(--border-color)',
          hover: 'var(--bg-hover)',
        },
        // Text colors
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        muted: 'var(--text-muted)',
        // Accent
        accent: 'var(--accent)',
        'accent-dim': 'var(--accent-dim)',
        // Ring colors
        ring: {
          calories: 'var(--ring-calories)',
          protein: 'var(--ring-protein)',
          carbs: 'var(--ring-carbs)',
          fat: 'var(--ring-fat)',
          water: 'var(--ring-water)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'card': '14px',
      },
    },
  },
  plugins: [],
}
