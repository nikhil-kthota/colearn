import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use root base for Vercel, but keep the repo name for GitHub Pages
  base: process.env.VERCEL ? '/' : '/collaborative-learning/',
})
