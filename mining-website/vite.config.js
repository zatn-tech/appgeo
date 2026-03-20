import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    proxy: {
      // Local dev: send API requests to the Node backend.
      // Production: cPanel maps `/api/*` to the Node app.
      '/api': 'http://localhost:4000',
    },
  },
})
