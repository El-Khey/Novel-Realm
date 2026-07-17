import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft01Icon,
    ArrowRight01Icon,
    ArrowUp01Icon,
    CheckmarkCircle02Icon,
    Flag02Icon,
    Home09Icon,
    LeftToRightListBulletIcon,
    Settings02Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { getChapter } from "@/features/novels/chapter.service";
import { getNovel } from "@/features/novels/novel.service";
import { useChapters } from "@/features/novels/hooks/useChapters";
import { useNovelProgress } from "@/features/progress/hooks/useNovelProgress";
import type { ChapterDetail } from "@/features/novels/types";
import { useReaderPrefs, READER_FONTS, READER_WIDTHS } from "@/features/reader/useReaderPrefs";
import { ReaderSettings } from "@/features/reader/components/ReaderSettings";
import { ApiError } from "@/lib/http";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

type LoadState =
    | { status: "loading" }
    | { status: "error"; message: string }
    | { status: "loaded"; chapter: ChapterDetail };

export default function ChapterReaderPage() {
    const { novelId: novelIdParam, chapterId } = useParams();
    const navigate = useNavigate();
    const novelId = Number(novelIdParam);
    const id = Number(chapterId);
    const validId = Number.isInteger(id) && id > 0;

    const [state, setState] = useState<LoadState>({ status: "loading" });

    const { chapters } = useChapters(novelId);
    const { progressById, readIds, loaded: progressLoaded, setRead, savePosition } =
        useNovelProgress(novelId);

    // Réglages d'affichage (persistés localStorage) + couleurs résolues.
    const { prefs, update, selectTheme, reset, fg, bg } = useReaderPrefs();

    const [settingsOpen, setSettingsOpen] = useState(false);
    const [progress, setProgress] = useState(0);
    const [headerHidden, setHeaderHidden] = useState(false);
    const [showTop, setShowTop] = useState(false);
    const [novelTitle, setNovelTitle] = useState<string | null>(null);

    const loaded = state.status === "loaded";
    const restoredRef = useRef<number | null>(null);

    // Chargement du chapitre.
    useEffect(() => {
        if (!validId) return;
        let active = true;
        setState({ status: "loading" });
        restoredRef.current = null;
        getChapter(id)
            .then((chapter) => active && setState({ status: "loaded", chapter }))
            .catch((e) => {
                if (!active) return;
                const notFound = e instanceof ApiError && e.status === 404;
                setState({
                    status: "error",
                    message: notFound
                        ? "Ce chapitre n'existe pas."
                        : e instanceof Error
                          ? e.message
                          : "Erreur inconnue",
                });
            });
        return () => {
            active = false;
        };
    }, [id, validId]);

    // Titre du roman (pour l'en-tête).
    useEffect(() => {
        if (!Number.isInteger(novelId) || novelId <= 0) return;
        let active = true;
        getNovel(novelId)
            .then((n) => active && setNovelTitle(n.title))
            .catch(() => {});
        return () => {
            active = false;
        };
    }, [novelId]);

    // Restaure la position de reprise une fois chapitre + progression chargés.
    useEffect(() => {
        if (!loaded || !progressLoaded || restoredRef.current === id) return;
        restoredRef.current = id;
        const saved = progressById.get(id)?.scrollPosition ?? 0;
        if (saved > 0 && saved < 100) {
            requestAnimationFrame(() => {
                const max = document.documentElement.scrollHeight - window.innerHeight;
                if (max > 0) window.scrollTo({ top: (saved / 100) * max });
            });
        }
    }, [loaded, progressLoaded, id, progressById]);

    // Sauvegarde débouncée de la position pendant le défilement.
    useEffect(() => {
        if (!loaded) return;
        let timer: ReturnType<typeof setTimeout>;
        function onScroll() {
            clearTimeout(timer);
            timer = setTimeout(() => {
                const max = document.documentElement.scrollHeight - window.innerHeight;
                const percent = max > 0 ? Math.min(100, Math.round((window.scrollY / max) * 100)) : 0;
                savePosition(id, percent);
            }, 800);
        }
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => {
            clearTimeout(timer);
            window.removeEventListener("scroll", onScroll);
        };
    }, [loaded, id, savePosition]);

    // Barre de progression + masquage de l'en-tête + bouton « haut de page ».
    useEffect(() => {
        let raf = 0;
        let lastY = window.scrollY;
        function onScroll() {
            if (raf) return;
            raf = requestAnimationFrame(() => {
                raf = 0;
                const y = window.scrollY;
                const max = document.documentElement.scrollHeight - window.innerHeight;
                setProgress(max > 0 ? Math.min(100, Math.max(0, (y / max) * 100)) : 0);
                setShowTop(y > 500);
                if (y < 80) setHeaderHidden(false);
                else if (y > lastY + 6) setHeaderHidden(true);
                else if (y < lastY - 6) setHeaderHidden(false);
                lastY = y;
            });
        }
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
        return () => {
            window.removeEventListener("scroll", onScroll);
            if (raf) cancelAnimationFrame(raf);
        };
    }, [state.status]);

    // Chapitres préc./suivant (liste triée par numéro).
    const index = chapters?.findIndex((c) => c.id === id) ?? -1;
    const prevId = index > 0 ? chapters![index - 1].id : null;
    const nextId =
        chapters && index >= 0 && index < chapters.length - 1 ? chapters[index + 1].id : null;

    // Navigation clavier ← / → (hors saisie et hors panneau ouvert).
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (settingsOpen) return;
            const el = e.target as HTMLElement | null;
            if (
                el &&
                (el.tagName === "INPUT" ||
                    el.tagName === "TEXTAREA" ||
                    el.tagName === "SELECT" ||
                    el.isContentEditable)
            )
                return;
            if (e.key === "ArrowLeft" && prevId != null)
                navigate(`/novels/${novelId}/chapters/${prevId}`);
            else if (e.key === "ArrowRight" && nextId != null)
                navigate(`/novels/${novelId}/chapters/${nextId}`);
        }
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [settingsOpen, prevId, nextId, novelId, navigate]);

    const isRead = readIds.has(id);

    // Découpe le contenu en paragraphes (double saut de ligne, sinon simple).
    const content = state.status === "loaded" ? state.chapter.content : "";
    const paragraphs = useMemo(() => {
        const byBlank = content.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);
        return byBlank.length > 1
            ? byBlank
            : content.split(/\n/).map((s) => s.trim()).filter(Boolean);
    }, [content]);

    const fontStack = READER_FONTS[prefs.fontId].stack;

    // Seules --reader-bg/fg servent au chrome adaptatif (color-mix). Les propriétés
    // du texte sont appliquées en valeurs concrètes (typage plus simple).
    const rootStyle = {
        "--reader-bg": bg,
        "--reader-fg": fg,
        background: "var(--reader-bg)",
    } as CSSProperties;

    const proseStyle: CSSProperties = {
        color: fg,
        fontFamily: fontStack,
        fontSize: `${prefs.fontSize}px`,
        lineHeight: prefs.lineHeight,
        fontWeight: prefs.fontWeight,
        textAlign: prefs.justify ? "justify" : "left",
    };

    return (
        <div className="dark relative min-h-screen" style={rootStyle}>
            {/* Progression de lecture : rail vertical à gauche + pourcentage */}
            <div className="fixed left-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-2 md:flex">
                <div
                    className="relative w-1 overflow-hidden rounded-full"
                    style={{
                        height: "9rem",
                        background: "color-mix(in srgb, var(--reader-fg) 14%, transparent)",
                    }}
                >
                    <div
                        className="absolute inset-x-0 top-0 rounded-full bg-primary transition-[height] duration-150 ease-out motion-reduce:transition-none"
                        style={{ height: `${progress}%` }}
                    />
                </div>
                <span
                    className="text-[11px] font-medium tabular-nums"
                    style={{ color: "var(--reader-fg)", opacity: 0.55 }}
                >
                    {Math.round(progress)}%
                </span>
            </div>

            {/* En-tête (masqué en mode focus, auto-masqué au défilement) */}
            {!prefs.focusMode && (
                <header
                    style={{
                        color: "var(--reader-fg)",
                        background: "color-mix(in srgb, var(--reader-bg) 82%, transparent)",
                        borderColor: "color-mix(in srgb, var(--reader-fg) 12%, transparent)",
                    }}
                    className={cn(
                        "sticky top-0 z-40 border-b backdrop-blur-md transition-transform duration-300 motion-reduce:transition-none",
                        headerHidden && "-translate-y-full",
                    )}
                >
                    <div className="mx-auto flex h-14 max-w-5xl items-center gap-2 px-3 sm:gap-3 sm:px-5">
                        {/* Retour au roman */}
                        <Link
                            to={`/novels/${novelId}`}
                            aria-label="Retour au roman"
                            className="grid size-9 shrink-0 place-items-center rounded-full opacity-75 transition-opacity hover:opacity-100"
                        >
                            <Icon icon={ArrowLeft01Icon} size={20} />
                        </Link>

                        {/* Titre du roman + chapitre */}
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold leading-tight">
                                {novelTitle ?? " "}
                            </p>
                            {loaded && (
                                <p className="truncate text-xs leading-tight opacity-55">
                                    Chapitre {state.chapter.chapterNumber}
                                </p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex shrink-0 items-center gap-0.5">
                            <HeaderIcon icon={Home09Icon} label="Accueil" onClick={() => navigate("/")} />
                            <HeaderIcon
                                icon={LeftToRightListBulletIcon}
                                label="Liste des chapitres"
                                onClick={() => navigate(`/novels/${novelId}`)}
                            />
                            {loaded && (
                                <HeaderIcon
                                    icon={CheckmarkCircle02Icon}
                                    label={isRead ? "Marqué comme lu" : "Marquer comme lu"}
                                    active={isRead}
                                    onClick={() => setRead(id, !isRead)}
                                />
                            )}
                            <HeaderIcon
                                icon={Settings02Icon}
                                label="Réglages de lecture"
                                onClick={() => setSettingsOpen(true)}
                            />
                            <HeaderIcon icon={Flag02Icon} label="Signaler (bientôt)" onClick={() => {}} />
                        </div>
                    </div>
                </header>
            )}

            {/* Contenu */}
            <div
                className="mx-auto px-5 py-10 sm:px-8 sm:py-14"
                style={{ maxWidth: READER_WIDTHS[prefs.widthId].max }}
            >
                {!validId || state.status === "error" ? (
                    <ReaderMessage>
                        {validId && state.status === "error" ? state.message : "Ce chapitre n'existe pas."}
                    </ReaderMessage>
                ) : state.status === "loading" ? (
                    <ReaderMessage>Chargement…</ReaderMessage>
                ) : (
                    <article>
                        <p
                            className="text-xs font-semibold uppercase tracking-wide"
                            style={{ color: "var(--reader-fg)", opacity: 0.6 }}
                        >
                            Chapitre {state.chapter.chapterNumber}
                        </p>
                        <h1
                            className="mt-1 text-3xl font-bold tracking-tight"
                            style={{ color: "var(--reader-fg)", fontFamily: fontStack }}
                        >
                            {state.chapter.title}
                        </h1>

                        {/* Fin séparateur sous le titre (pas de nav en haut). */}
                        <div
                            className="mt-6 mb-9 h-px"
                            style={{ background: "color-mix(in srgb, var(--reader-fg) 14%, transparent)" }}
                        />

                        <div style={proseStyle}>
                            {paragraphs.map((p, i) => (
                                <p key={i} style={{ marginBottom: `${prefs.paragraphGap}em` }}>
                                    {p}
                                </p>
                            ))}
                        </div>

                        <ChapterNav novelId={novelId} prevId={prevId} nextId={nextId} />
                    </article>
                )}
            </div>

            {/* Boutons flottants : haut de page + réglages */}
            <div className="fixed bottom-5 right-5 z-40 flex flex-col gap-2.5">
                {showTop && (
                    <FloatButton
                        icon={ArrowUp01Icon}
                        label="Haut de page"
                        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    />
                )}
                <FloatButton
                    icon={Settings02Icon}
                    label="Réglages de lecture"
                    onClick={() => setSettingsOpen(true)}
                />
            </div>

            <ReaderSettings
                open={settingsOpen}
                onClose={() => setSettingsOpen(false)}
                prefs={prefs}
                update={update}
                selectTheme={selectTheme}
                reset={reset}
                fg={fg}
                bg={bg}
            />
        </div>
    );
}

/* -------------------------------- sous-vues -------------------------------- */

function ReaderMessage({ children }: { children: React.ReactNode }) {
    return (
        <p className="py-20 text-center text-sm" style={{ color: "var(--reader-fg)", opacity: 0.7 }}>
            {children}
        </p>
    );
}

function HeaderIcon({
    icon,
    label,
    onClick,
    active,
}: {
    icon: IconSvgElement;
    label: string;
    onClick: () => void;
    active?: boolean;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            aria-pressed={active}
            title={label}
            className={cn(
                "grid size-9 place-items-center rounded-full transition-opacity",
                active ? "opacity-100" : "opacity-70 hover:opacity-100",
            )}
            style={{ color: "var(--reader-fg)" }}
        >
            <Icon icon={icon} size={19} className={active ? "text-primary" : undefined} />
        </button>
    );
}

function ChapterNav({
    novelId,
    prevId,
    nextId,
}: {
    novelId: number;
    prevId: number | null;
    nextId: number | null;
}) {
    return (
        <nav
            className="my-8 flex items-center justify-between gap-3 border-y py-3"
            style={{ borderColor: "color-mix(in srgb, var(--reader-fg) 12%, transparent)" }}
        >
            <NavButton to={prevId != null ? `/novels/${novelId}/chapters/${prevId}` : null} dir="prev" />
            <NavButton to={nextId != null ? `/novels/${novelId}/chapters/${nextId}` : null} dir="next" />
        </nav>
    );
}

function NavButton({ to, dir }: { to: string | null; dir: "prev" | "next" }) {
    const cls = "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium";
    const body =
        dir === "prev" ? (
            <>
                <Icon icon={ArrowLeft01Icon} size={16} />
                Précédent
            </>
        ) : (
            <>
                Suivant
                <Icon icon={ArrowRight01Icon} size={16} />
            </>
        );
    if (!to) {
        return (
            <span className={cn(cls, "opacity-30")} style={{ color: "var(--reader-fg)" }} aria-disabled>
                {body}
            </span>
        );
    }
    return (
        <Link
            to={to}
            className={cn(cls, "opacity-80 transition-opacity hover:opacity-100")}
            style={{ color: "var(--reader-fg)" }}
        >
            {body}
        </Link>
    );
}

function FloatButton({
    icon,
    label,
    onClick,
}: {
    icon: IconSvgElement;
    label: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            title={label}
            className="grid size-11 place-items-center rounded-full border shadow-lg backdrop-blur transition hover:scale-105 motion-reduce:transition-none"
            style={{
                color: "var(--reader-fg)",
                background: "color-mix(in srgb, var(--reader-fg) 12%, var(--reader-bg))",
                borderColor: "color-mix(in srgb, var(--reader-fg) 15%, transparent)",
            }}
        >
            <Icon icon={icon} size={20} />
        </button>
    );
}
