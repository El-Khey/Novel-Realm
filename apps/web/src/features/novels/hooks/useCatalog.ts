import { useCallback, useEffect, useRef, useState } from "react";
import { searchNovels, type NovelQuery } from "@/features/novels/novel.service";
import type { Novel } from "@/features/novels/types";

/** Nombre de romans chargés par page (défilement infini). */
export const CATALOG_PAGE_SIZE = 24;

interface CatalogState {
  /** Romans accumulés (toutes les pages chargées), ou `null` pendant le 1er chargement. */
  items: Novel[] | null;
  /** Total de résultats côté serveur (pour le compteur « X novels »). */
  total: number;
  /** Reste-t-il des pages à charger ? */
  hasMore: boolean;
  /** Chargement d'une page supplémentaire en cours. */
  loadingMore: boolean;
  /** Erreur éventuelle (chargement initial ou pagination). */
  error: string | null;
}

const EMPTY: CatalogState = {
  items: null,
  total: 0,
  hasMore: false,
  loadingMore: false,
  error: null,
};

const message = (e: unknown) => (e instanceof Error ? e.message : "Erreur inconnue");

/**
 * Catalogue paginé avec défilement infini. Recharge depuis la page 0 dès qu'un
 * critère change ({@code q}, {@code genreId}, {@code status}, {@code sort}) et
 * accumule les pages suivantes via {@link loadMore}.
 *
 * <p>Robustesse :
 * <ul>
 *   <li>Garde de génération ({@code reqRef}) : une réponse dont les critères ont
 *       changé pendant le vol est jetée (pas de pollution de la nouvelle liste).</li>
 *   <li>Garde synchrone ({@code loadingRef}/{@code hasMoreRef}) : deux appels
 *       rapprochés à {@code loadMore} (observer + clic) ne déclenchent qu'un seul
 *       chargement.</li>
 * </ul>
 */
export function useCatalog(query: NovelQuery) {
  const { q, genreId, status, sort } = query;

  const [state, setState] = useState<CatalogState>(EMPTY);
  const [reloadKey, setReloadKey] = useState(0); // incrémenté par reload() → relance la page 0

  const pageRef = useRef(0); // dernière page chargée
  const reqRef = useRef(0); // génération de requête (invalide les réponses obsolètes)
  const loadingRef = useRef(false); // un fetch est en vol (garde synchrone)
  const hasMoreRef = useRef(false); // miroir synchrone de hasMore

  // (Re)chargement initial à chaque changement de critère (ou appel à reload()).
  useEffect(() => {
    const gen = ++reqRef.current;
    pageRef.current = 0;
    loadingRef.current = true;
    hasMoreRef.current = false;
    setState(EMPTY);

    searchNovels({ q, genreId, status, sort }, 0, CATALOG_PAGE_SIZE)
      .then((res) => {
        if (reqRef.current !== gen) return; // critères changés entre-temps
        loadingRef.current = false;
        hasMoreRef.current = res.page + 1 < res.totalPages;
        setState({
          items: res.content,
          total: res.totalElements,
          hasMore: hasMoreRef.current,
          loadingMore: false,
          error: null,
        });
      })
      .catch((e) => {
        if (reqRef.current !== gen) return;
        loadingRef.current = false;
        setState({ ...EMPTY, error: message(e) });
      });
  }, [q, genreId, status, sort, reloadKey]);

  const loadMore = useCallback(() => {
    if (loadingRef.current || !hasMoreRef.current) return; // garde synchrone
    const gen = reqRef.current;
    const next = pageRef.current + 1;
    loadingRef.current = true;
    // On efface l'erreur précédente : un « réessayer » repart proprement.
    setState((s) => ({ ...s, loadingMore: true, error: null }));

    searchNovels({ q, genreId, status, sort }, next, CATALOG_PAGE_SIZE)
      .then((res) => {
        if (reqRef.current !== gen) return; // page devenue obsolète
        pageRef.current = next;
        loadingRef.current = false;
        hasMoreRef.current = res.page + 1 < res.totalPages;
        setState((s) => ({
          ...s,
          items: [...(s.items ?? []), ...res.content],
          total: res.totalElements,
          hasMore: hasMoreRef.current,
          loadingMore: false,
        }));
      })
      .catch((e) => {
        if (reqRef.current !== gen) return;
        loadingRef.current = false;
        // On CONSERVE les items déjà chargés : seul un bandeau d'erreur s'ajoute.
        setState((s) => ({ ...s, loadingMore: false, error: message(e) }));
      });
  }, [q, genreId, status, sort]);

  /** Relance le chargement depuis la page 0 (bouton « réessayer » initial). */
  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  return { ...state, loadMore, reload };
}
