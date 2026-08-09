import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // bind 0.0.0.0 so the sandbox preview host can reach it
    // Allow the e2b preview host (and any host) to load the dev server.
    allowedHosts: true,
    // Proxy API calls to the Node backend so browser code can use relative
    // URLs (never localhost, which wouldn't resolve from the user's browser).
    proxy: {
      '/api': {
        target: process.env.VITE_PROXY_TARGET || 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
