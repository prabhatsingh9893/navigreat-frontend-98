import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// Node.js path utility ko import karo
import path from 'path'; 

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // YEH SECTION ADD KARO
  resolve: {
    alias: {
      // '@/' ab hamesha 'src/' folder ko point karega
      "@": path.resolve(__dirname, "./src"),
    },
  },
});