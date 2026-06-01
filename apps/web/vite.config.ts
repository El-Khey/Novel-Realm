import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),       // support de React (JSX, fast refresh)
    tailwindcss(), // active Tailwind CSS v4
  ],
  server: {
    // host: true → Vite écoute sur 0.0.0.0 (toutes les interfaces), pas seulement
    // 127.0.0.1. Indispensable sous WSL2 pour que le navigateur Windows puisse
    // joindre le serveur via localhost:5173.
    host: true,
  },
})
