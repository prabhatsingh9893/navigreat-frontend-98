import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  // ✅ FIX: Naam bilkul sahi hona chahiye (SLASH ke sath)
  base: command === 'build' ? '/navigreat-frontend-98/' : '/',

  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    headers: {
      // ⚠️ Inhe abhi commented hi rahne dein (Google Login ke liye ye zaruri hai)
      // "Cross-Origin-Embedder-Policy": "require-corp",
      // "Cross-Origin-Opener-Policy": "same-origin",
    },
  },
}));