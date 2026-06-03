import { useNovels } from './useNovels'
import { NovelCard } from './NovelCard'

export function NovelGrid() {
  const state = useNovels()

  if (state.status === 'loading') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="aspect-[2/3] rounded-xl bg-slate-800 animate-pulse" />
        ))}
      </div>
    )
  }

  if (state.status === 'error') {
    return (
      <p className="text-red-400 text-sm">Impossible de charger les novels : {state.message}</p>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {state.data.map((novel) => (
        <NovelCard key={novel.id} novel={novel} />
      ))}
    </div>
  )
}
