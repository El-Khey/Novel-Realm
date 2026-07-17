import {
    BookOpen01Icon,
    Bookmark02Icon,
    Bookshelf01Icon,
    Calendar03Icon,
    CheckmarkBadge01Icon,
    FireIcon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { useUserStats } from "@/features/profile/hooks/useUserStats";
import { Icon } from "@/components/ui/icon";

/**
 * Bandeau de statistiques résumées du profil (issue #17). La page de
 * statistiques détaillée arrivera avec l'issue #23.
 */
export function StatsStrip() {
    const { stats, error } = useUserStats();

    if (error) {
        return (
            <p className="text-xs text-muted-foreground">Statistiques indisponibles pour le moment.</p>
        );
    }

    if (!stats) {
        return (
            <div className="grid grid-cols-3 gap-3 md:grid-cols-6" aria-hidden="true">
                {Array.from({ length: 6 }, (_, i) => (
                    <div key={i} className="h-16 animate-pulse rounded-lg bg-secondary" />
                ))}
            </div>
        );
    }

    const tiles: { icon: IconSvgElement; value: string; label: string; title?: string }[] = [
        { icon: BookOpen01Icon, value: String(stats.chaptersRead), label: "Chapitres lus" },
        { icon: Bookshelf01Icon, value: String(stats.novelsFollowed), label: "Romans suivis" },
        { icon: CheckmarkBadge01Icon, value: String(stats.novelsCompleted), label: "Terminés" },
        { icon: Bookmark02Icon, value: String(stats.chaptersFavorited), label: "Favoris" },
        { icon: Calendar03Icon, value: String(stats.readingDays), label: "Jours de lecture" },
        {
            icon: FireIcon,
            value: `${stats.currentStreak} j`,
            label: "Série en cours",
            title: `Record : ${stats.longestStreak} jour${stats.longestStreak > 1 ? "s" : ""} d'affilée`,
        },
    ];

    return (
        <dl className="grid grid-cols-3 gap-3 md:grid-cols-6">
            {tiles.map((t) => (
                <div
                    key={t.label}
                    title={t.title}
                    className="rounded-lg border border-border bg-secondary/40 px-3 py-2.5"
                >
                    <dt className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                        <Icon icon={t.icon} size={13} />
                        {t.label}
                    </dt>
                    <dd className="mt-0.5 font-heading text-lg font-bold tabular-nums">{t.value}</dd>
                </div>
            ))}
        </dl>
    );
}
