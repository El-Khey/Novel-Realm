import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardAction,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { NovelCover } from "@/features/novels/components/NovelCover";
import { NOVEL_STATUS } from "@/features/novels/status";
import type { Novel } from "@/features/novels/types";

export function NovelCard({ novel, unreadCount }: { novel: Novel; unreadCount?: number }) {
    const status = NOVEL_STATUS[novel.status];

    return (
        <Link
            to={`/novels/${novel.id}`}
            className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
            <Card className="relative h-full gap-0 overflow-hidden pt-0 transition-colors group-hover:border-primary/40">
                {unreadCount != null && unreadCount > 0 && (
                    <span
                        className="absolute left-2 top-2 z-10 rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground shadow"
                        title={`${unreadCount} chapitre${unreadCount > 1 ? "s" : ""} non lu${unreadCount > 1 ? "s" : ""}`}
                    >
                        {unreadCount}
                    </span>
                )}
                <NovelCover title={novel.title} coverImageUrl={novel.coverImageUrl} />

                <CardHeader className="pt-4">
                    <CardAction>
                        <Badge variant={status.variant}>{status.label}</Badge>
                    </CardAction>
                    <CardTitle className="line-clamp-1">{novel.title}</CardTitle>
                    <CardDescription className="line-clamp-1">{novel.author}</CardDescription>
                </CardHeader>
            </Card>
        </Link>
    );
}
