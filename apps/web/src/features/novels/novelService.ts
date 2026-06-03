import { apiGet } from '../../lib/apiClient'
import type { Novel } from './novel.types'

export function fetchNovels(): Promise<Novel[]> {
  return apiGet<Novel[]>('/api/novels')
}

export function fetchNovel(id: number): Promise<Novel> {
  return apiGet<Novel>(`/api/novels/${id}`)
}
