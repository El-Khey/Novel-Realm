// Front volontairement minimal : on repart de zéro.
// Plus de routeur, plus de pages, plus d'appels API pour l'instant —
// juste de quoi vérifier que le front démarre. On le construira au fur
// et à mesure, tranquillement.
export default function App() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-2">
      <h1 className="text-3xl font-bold">Novel Realm</h1>
      <p className="text-gray-500">Front réinitialisé — on repart propre.</p>
    </main>
  )
}
