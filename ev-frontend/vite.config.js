import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Development server proxy: forward API calls to backend to avoid CORS and 404 from Vite
  server: {
    proxy: {
      // Proxy any request starting with /api to the Spring Boot backend
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        // rewrite not necessary because paths are identical, but kept for clarity
        rewrite: (path) => path,
      },
    },
  },
});
