import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useHistory } from "@/features/history/hooks/useHistory";
import type { HistoryEntry, HistorySort } from "@/features/history/types";
import { NovelCover } from "@/features/novels/components/NovelCover";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/ui/AppLayout";

const SELECT_CLASS =
    "h-9 rounded-md border border-border bg-input/30 px-2 text-sm text-foreground transition-colors hover:bg-input/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50";

const dateFmt = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" });

// Cible du modal de confirmation : tout vider, ou un roman précis.
type Confirm = { kind: "all" } | { kind: "novel"; id: number; title: string };

// Page Historique : liste paginée des chapitres ouverts (lus ou entamés),
// triable, filtrable par roman, avec reprise et purge. Exerce /api/history.
export default function HistoryPage() {
    const { data, error, sort, setSort, novelId, setNovelId, page, setPage, clearAll, clearNovel } =
        useHistory();
    const [confirm, setConfirm] = useState<Confirm | null>(null);

    // Options du filtre : on accumule les romans vus au fil des pages pour que
    // la liste reste stable même quand un filtre est actif (le back ne renvoie
    // alors qu'un seul roman).
    const [novelOptions, setNovelOptions] = useState<Map<number, string>>(new Map());
    useEffect(() => {
        if (!data) return;
        setNovelOptions((prev) => {
            const next = new Map(prev);
            for (const e of data.content) next.set(e.novelId, e.novelTitle);
            return next;
        });
    }, [data]);
    const sortedOptions = useMemo(
        () => [...novelOptions.entries()].sort((a, b) => a[1].localeCompare(b[1])),
        [novelOptions],
    );

    async function runConfirm() {
        if (!confirm) return;
        if (confirm.kind === "all") await clearAll();
        else await clearNovel(confirm.id);
        setConfirm(null);
    }

    return (
        <AppLayout>
            <div className="mx-auto max-w-4xl px-6 py-10">
                <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Historique de lecture</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Les chapitres que vous avez ouverts, les plus récents d'abord.
                        </p>
                    </div>
                    {data && data.totalElements > 0 && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setConfirm({ kind: "all" })}
                        >
                            Tout vider
                        </Button>
                    )}
                </header>

                {/* Tri + filtre par roman */}
                <div className="mb-6 flex flex-wrap items-center gap-2">
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value as HistorySort)}
                        aria-label="Trier l'historique"
                        className={SELECT_CLASS}
                    >
                        <option value="date">Plus récents</option>
                        <option value="novel">Par roman</option>
                    </select>
                    <select
                        value={novelId ?? ""}
                        onChange={(e) => setNovelId(e.target.value ? Number(e.target.value) : null)}
                        aria-label="Filtrer par roman"
                        className={SELECT_CLASS}
                    >
                        <option value="">Tous les romans</option>
                        {sortedOptions.map(([id, title]) => (
                            <option key={id} value={id}>
                                {title}
                            </option>
                        ))}
                    </select>
                </div>

                {error ? (
                    <p className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                        Impossible de charger l'historique : {error}
                    </p>
                ) : data === null ? (
                    <p className="text-sm text-muted-foreground">Chargement…</p>
                ) : data.content.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        {novelId
                            ? "Aucune lecture pour ce roman."
                            : "Votre historique est vide. Ouvrez un chapitre pour le remplir."}
                    </p>
                ) : (
                    <>
                        <ul className="divide-y divide-border rounded-lg border border-border">
                            {data.content.map((entry) => (
                                <HistoryRow
                                    key={entry.chapterId}
                                    entry={entry}
                                    onClearNovel={() =>
                                        setConfirm({
                                            kind: "novel",
                                            id: entry.novelId,
                                            title: entry.novelTitle,
                                        })
                                    }
                                />
                            ))}
                        </ul>

                        {data.totalPages > 1 && (
                            <div className="mt-6 flex items-center justify-center gap-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page === 0}
                                    onClick={() => setPage(page - 1)}
                                >
                                    Précédent
                                </Button>
                                <span className="text-sm text-muted-foreground">
                                    Page {data.page + 1} / {data.totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page >= data.totalPages - 1}
                                    onClick={() => setPage(page + 1)}
                                >
                                    Suivant
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Confirmation de purge */}
            <Modal
                open={confirm !== null}
                onClose={() => setConfirm(null)}
                title={confirm?.kind === "all" ? "Vider tout l'historique ?" : "Vider ce roman ?"}
            >
                <p className="text-sm text-muted-foreground">
                    {confirm?.kind === "all"
                        ? "Toutes vos lectures seront retirées de l'historique. Cette action est irréversible."
                        : confirm?.kind === "novel"
                          ? `L'historique de « ${confirm.title} » sera supprimé. Cette action est irréversible.`
                          : ""}
                </p>
                <div className="mt-6 flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setConfirm(null)}>
                        Annuler
                    </Button>
                    <Button variant="destructive" size="sm" onClick={runConfirm}>
                        Supprimer
                    </Button>
                </div>
            </Modal>
        </AppLayout>
    );
}

/** Une ligne d'historique : vignette, chapitre, état, date, reprise, purge. */
function HistoryRow({ entry, onClearNovel }: { entry: HistoryEntry; onClearNovel: () => void }) {
    return (
        <li className="flex items-center gap-4 px-4 py-3">
            <Link to={`/novels/${entry.novelId}`} className="w-10 shrink-0">
                <NovelCover
                    title={entry.novelTitle}
                    coverImageUrl={entry.novelCoverImageUrl}
                    className="rounded"
                />
            </Link>

            <div className="min-w-0 flex-1">
                <Link
                    to={`/novels/${entry.novelId}`}
                    className="block truncate font-medium hover:underline"
                >
                    {entry.novelTitle}
                </Link>
                <p className="truncate text-sm text-muted-foreground">
                    Ch. {entry.chapterNumber} — {entry.chapterTitle}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">{dateFmt.format(new Date(entry.readAt))}</p>
            </div>

            <StatusBadge read={entry.read} position={entry.scrollPosition} />

            <Button asChild size="sm" variant="secondary">
                <Link to={`/novels/${entry.novelId}/chapters/${entry.chapterId}`}>Reprendre</Link>
            </Button>

            <Button
                size="icon-sm"
                variant="ghost"
                aria-label={`Vider l'historique de ${entry.novelTitle}`}
                title="Vider l'historique de ce roman"
                onClick={onClearNovel}
                className="text-muted-foreground hover:text-destructive"
            >
                <TrashIcon />
            </Button>
        </li>
    );
}

/** Pastille d'état : « Lu » si terminé, sinon la position de reprise. */
function StatusBadge({ read, position }: { read: boolean; position: number }) {
    if (read) {
        return (
            <span className="hidden shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary sm:inline">
                Lu
            </span>
        );
    }
    return (
        <span className="hidden shrink-0 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground sm:inline">
            à {position}%
        </span>
    );
}

function TrashIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-4"
            aria-hidden="true"
        >
            <path d="M3 6h18" />
            <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        </svg>
    );
}
