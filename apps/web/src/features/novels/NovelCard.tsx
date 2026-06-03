import type { Novel } from './novel.types'

const STATUS_LABEL: Record<Novel['status'], string> = {
  ONGOING: 'En cours',
  COMPLETED: 'Terminé',
  HIATUS: 'En pause',
}

const STATUS_COLOR: Record<Novel['status'], string> = {
  ONGOING: 'bg-emerald-500/20 text-emerald-400',
  COMPLETED: 'bg-sky-500/20 text-sky-400',
  HIATUS: 'bg-amber-500/20 text-amber-400',
}

interface Props {
  novel: Novel
}

export function NovelCard({ novel }: Props) {
  return (
    <article className="group flex flex-col rounded-xl overflow-hidden bg-slate-800 border border-slate-700 hover:border-slate-500 transition-colors cursor-pointer">
      <div className="aspect-[2/3] overflow-hidden bg-slate-700">
        <img
          src={novel.coverUrl}
          alt={novel.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src = `https://placehold.co/200x300/1e293b/94a3b8?text=${encodeURIComponent(novel.title)}`
          }}
        />
      </div>

      <div className="flex flex-col gap-1 p-3">
        <span className={`self-start text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLOR[novel.status]}`}>
          {STATUS_LABEL[novel.status]}
        </span>
        <h2 className="text-sm font-semibold text-white leading-snug line-clamp-2">{novel.title}</h2>
        <p className="text-xs text-slate-400">{novel.author}</p>
      </div>
    </article>
  )
}
