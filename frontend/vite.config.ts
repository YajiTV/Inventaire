import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    // .learn contient les tests du parcours d'apprentissage, hors du projet.
    exclude: ['**/node_modules/**', '**/dist/**', '.learn/**'],
  },
})
