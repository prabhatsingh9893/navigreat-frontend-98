import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  // Base path varies: root for dev, repo name for GitHub Pages production
  base: command === 'build' ? '/navigreat-/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    headers: {
      // ⚠️ Headers relaxed to ensure Google Login Popup works correctly.
      // Uncomment strictly if SharedArrayBuffer (Zoom Gallery View) is mandatory.
      // "Cross-Origin-Embedder-Policy": "require-corp",
      // "Cross-Origin-Opener-Policy": "same-origin",
    },
  },
}));