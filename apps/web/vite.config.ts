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
    // Dans un conteneur Docker, les événements de fichiers (inotify) ne
    // traversent pas toujours le volume monté → le hot-reload ne se déclenche
    // pas. On active alors le "polling" (Vite vérifie les fichiers à intervalle
    // régulier), uniquement via la variable VITE_USE_POLLING (0 impact en dev
    // natif hors Docker).
    watch: process.env.VITE_USE_POLLING ? { usePolling: true } : undefined,
  },
})
