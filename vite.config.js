import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// In dev the app is served from "/". The production build is published to
// GitHub Pages under /testingpreload/, so the build uses that base. host: true
// binds 0.0.0.0 so the dev server is reachable if you ever run it locally.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/testingpreload/' : '/',
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
}))
