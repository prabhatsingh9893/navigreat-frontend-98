import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    headers: {
      // ✅ FIX: Login के लिए इसे 'unsafe-none' करना सबसे सुरक्षित है।
      // 'same-origin' हटाना पड़ेगा क्योंकि वो Popup को ब्लॉक करता है।
      "Cross-Origin-Embedder-Policy": "unsafe-none",
      
      // 👇 यह लाइन या तो हटा दें या 'unsafe-none' कर दें
      // "Cross-Origin-Opener-Policy": "same-origin", 
    },
  },
});