/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      colors: {
        'nav-navy': '#0f0c29',
        'nav-indigo': '#4f46e5',
        'nav-violet': '#7c3aed',
        'nav-accent': '#06b6d4',
      },
      boxShadow: {
        'glow-indigo': '0 0 40px rgba(99, 102, 241, 0.2)',
        'glow-violet': '0 0 40px rgba(139, 92, 246, 0.2)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 20px 60px rgba(0, 0, 0, 0.12)',
      },
      animation: {
        'float': 'float 4s ease-in-out infinite',
        'shimmer': 'shimmer 3s linear infinite',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}