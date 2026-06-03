import { useEffect, useState } from 'react'
import { fetchNovels } from './novelService'
import type { Novel } from './novel.types'

type State =
  | { status: 'loading' }
  | { status: 'success'; data: Novel[] }
  | { status: 'error'; message: string }

export function useNovels() {
  const [state, setState] = useState<State>({ status: 'loading' })

  useEffect(() => {
    fetchNovels()
      .then((data) => setState({ status: 'success', data }))
      .catch((err: unknown) =>
        setState({ status: 'error', message: err instanceof Error ? err.message : 'Erreur inconnue' }),
      )
  }, [])

  return state
}
