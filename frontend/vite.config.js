import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../public'  // Output to public instead of dist (the vite default)
  },
  server: {
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: ['all', process.env.REPLIT_DEV_DOMAIN, '.replit.dev'].filter(Boolean),
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
