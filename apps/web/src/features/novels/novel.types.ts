export type NovelStatus = 'ONGOING' | 'COMPLETED' | 'HIATUS'

export interface Novel {
  id: number
  title: string
  author: string
  coverUrl: string
  status: NovelStatus
}
