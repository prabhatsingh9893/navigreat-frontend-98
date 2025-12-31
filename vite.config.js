import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  // ✅ FIX: Absolute path for Vercel stability (Avoids header/MIME errors)
  base: '/',

  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: 'http://localhost:5000', // Forward socket connections to backend
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
    headers: {
      // ⚠️ Commented out to prevent "Blocked by Response" error for Zoom assets
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin",
    },
  },
}));// forced restart timestamp: 123456