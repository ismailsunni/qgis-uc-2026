import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Served from https://<user>.github.io/qgis-uc-schedule-viewer/
export default defineConfig({
  base: process.env.GITHUB_PAGES ? '/qgis-uc-schedule-viewer/' : '/',
  plugins: [react()],
})
