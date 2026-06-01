import { useEffect, useState } from 'react'
import { apiGet } from './api/client'

// Forme de la réponse attendue de /api/ping → { "message": "pong" }
type PingResponse = {
  message: string
}

function App() {
  // 3 états possibles : en cours de chargement, succès, erreur.
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading')
  const [message, setMessage] = useState<string>('')

  // useEffect avec [] = s'exécute une fois, au montage du composant.
  useEffect(() => {
    apiGet<PingResponse>('/api/ping')
      .then((data) => {
        setMessage(data.message)
        setStatus('ok')
      })
      .catch(() => setStatus('error'))
  }, [])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50 text-slate-800">
      <h1 className="text-3xl font-bold">📚 Anama</h1>
      <p className="text-slate-500">Lecteur de Light Novels</p>

      <div className="mt-4 rounded-lg border px-4 py-3 text-sm">
        {status === 'loading' && <span>Connexion au backend…</span>}
        {status === 'ok' && (
          <span className="text-green-600">
            ✅ Backend connecté — réponse : « {message} »
          </span>
        )}
        {status === 'error' && (
          <span className="text-red-600">
            ❌ Impossible de joindre le backend (est-il démarré ?)
          </span>
        )}
      </div>
    </main>
  )
}

export default App
