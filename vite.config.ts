import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base должен совпадать с именем репозитория на GitHub Pages
export default defineConfig({
  base: '/realty/',
  plugins: [react(), tailwindcss()],
})
