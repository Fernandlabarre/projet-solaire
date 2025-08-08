import { defineConfig } from 'vite'
export default defineConfig({
  server: {
    host: '0.0.0.0',    // écoute toutes les interfaces, pas juste localhost
    port: 5173,         // ou le port de votre choix
  },
})
