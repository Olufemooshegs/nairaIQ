import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite config: proxy /api to backend to avoid CORS during local dev
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
