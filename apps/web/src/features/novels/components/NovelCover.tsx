import { cn } from "@/lib/utils";

function BookIcon({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
        >
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
    );
}

type NovelCoverProps = {
    title: string;
    coverImageUrl: string | null;
    className?: string;
};

/** Couverture d'un roman (ratio livre 3:4) avec fallback quand l'image manque. */
export function NovelCover({ title, coverImageUrl, className }: NovelCoverProps) {
    return (
        <div className={cn("aspect-3/4 w-full overflow-hidden bg-secondary", className)}>
            {coverImageUrl ? (
                <img
                    src={coverImageUrl}
                    alt={`Couverture de ${title}`}
                    className="size-full object-cover"
                />
            ) : (
                <div className="flex size-full flex-col items-center justify-center gap-3 p-4 text-center">
                    <BookIcon className="size-8 text-muted-foreground" />
                    <span className="line-clamp-3 text-sm font-medium text-muted-foreground">
                        {title}
                    </span>
                </div>
            )}
        </div>
    );
}
