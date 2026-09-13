import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Served from a GitHub Pages project site; the repo name is the base path,
// read from the environment so renaming the repo cannot break the build.
const repo = process.env.GITHUB_REPOSITORY?.split('/')[1]

export default defineConfig({
  base: repo ? `/${repo}/` : '/',
  plugins: [react()],
})
