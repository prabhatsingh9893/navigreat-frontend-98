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
        slate: {
          150: '#eef1f6',
          850: '#131c2e',
        },
        gray: {
          555: '#626d7f',
          650: '#414a58',
        },
        teal: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          650: '#2056df',
          655: '#1c52e4',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        cyan: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
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