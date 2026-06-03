import { NovelGrid } from '../novels'

export function HomePage() {
  return (
    <section>
      <h1 className="text-2xl font-bold mb-6">Bibliothèque</h1>
      <NovelGrid />
    </section>
  )
}
