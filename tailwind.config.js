/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      },
      colors: {
        'nav-navy': '#0a192f',
        'nav-green': '#64ffda',
        'nav-blue': '#3b82f6',
      }
    },
  },
  plugins: [],
}