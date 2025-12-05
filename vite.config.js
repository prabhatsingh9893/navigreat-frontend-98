import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; 

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // 1. Yeh tumhara Alias wala code (Shortcuts ke liye)
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // 2. YEH NAYA PART HAI (Google Login Error fix karne ke liye)
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
    },
  },
});