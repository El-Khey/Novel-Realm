import { useCallback, useEffect, useState } from "react";

/** Identifiants des options du lecteur. */
export type ReaderThemeId = "clair" | "sepia" | "sombre" | "oled";
export type ReaderFontId = "sans" | "serif" | "dyslexic";
export type ReaderWidthId = "narrow" | "medium" | "wide" | "full";

/** Préférences de lecture, persistées en localStorage. */
export interface ReaderPrefs {
    themeId: ReaderThemeId;
    /** Couleurs perso : null = on prend celles du thème choisi. */
    fg: string | null;
    bg: string | null;
    fontId: ReaderFontId;
    fontSize: number; // px
    lineHeight: number; // sans unité
    paragraphGap: number; // em
    fontWeight: number; // 300..700
    justify: boolean;
    widthId: ReaderWidthId;
    focusMode: boolean;
}

export const READER_THEMES: Record<ReaderThemeId, { label: string; fg: string; bg: string }> = {
    clair: { label: "Clair", fg: "#1b1b1f", bg: "#fbfbf7" },
    sepia: { label: "Sépia", fg: "#4a3c2c", bg: "#f3e9d6" },
    sombre: { label: "Sombre", fg: "#d7d7dd", bg: "#17171b" },
    oled: { label: "Noir", fg: "#c9c9d1", bg: "#000000" },
};

export const READER_FONTS: Record<ReaderFontId, { label: string; stack: string }> = {
    sans: { label: "Sans", stack: "'Figtree Variable', system-ui, sans-serif" },
    serif: { label: "Serif", stack: "'Iowan Old Style', Georgia, 'Times New Roman', serif" },
    // OpenDyslexic n'est pas embarqué : on retombe sur des polices lisibles si absente.
    dyslexic: {
        label: "Dyslexie",
        stack: "'OpenDyslexic', 'Atkinson Hyperlegible', 'Comic Sans MS', sans-serif",
    },
};

export const READER_WIDTHS: Record<ReaderWidthId, { label: string; max: string }> = {
    narrow: { label: "Étroite", max: "36rem" },
    medium: { label: "Moyenne", max: "44rem" },
    wide: { label: "Large", max: "56rem" },
    full: { label: "Pleine", max: "80rem" },
};

/** Poids de police proposés. */
export const READER_WEIGHTS: { label: string; value: number }[] = [
    { label: "Léger", value: 300 },
    { label: "Normal", value: 400 },
    { label: "Gras", value: 600 },
];

/** Bornes des curseurs. */
export const SIZE_RANGE = { min: 14, max: 30, step: 1 };
export const LEADING_RANGE = { min: 1.3, max: 2.4, step: 0.1 };
export const GAP_RANGE = { min: 0.4, max: 2.4, step: 0.1 };

export const DEFAULT_PREFS: ReaderPrefs = {
    themeId: "sombre",
    fg: null,
    bg: null,
    fontId: "serif",
    fontSize: 19,
    lineHeight: 1.7,
    paragraphGap: 1.1,
    fontWeight: 400,
    justify: false,
    widthId: "medium",
    focusMode: false,
};

const STORAGE_KEY = "reader-prefs";

function load(): ReaderPrefs {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return DEFAULT_PREFS;
        // Fusion avec les défauts : tolère les anciennes versions partielles.
        return { ...DEFAULT_PREFS, ...(JSON.parse(raw) as Partial<ReaderPrefs>) };
    } catch {
        return DEFAULT_PREFS;
    }
}

/**
 * Préférences de lecture + persistance localStorage. Renvoie les couleurs
 * résolues ({@link fg}/{@link bg} : perso si définies, sinon celles du thème).
 */
export function useReaderPrefs() {
    const [prefs, setPrefs] = useState<ReaderPrefs>(load);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
        } catch {
            /* quota plein / navigation privée : on ignore silencieusement */
        }
    }, [prefs]);

    const update = useCallback(<K extends keyof ReaderPrefs>(key: K, value: ReaderPrefs[K]) => {
        setPrefs((p) => ({ ...p, [key]: value }));
    }, []);

    /** Choisit un thème prédéfini (efface les couleurs perso pour reprendre celles du thème). */
    const selectTheme = useCallback((themeId: ReaderThemeId) => {
        setPrefs((p) => ({ ...p, themeId, fg: null, bg: null }));
    }, []);

    const reset = useCallback(() => setPrefs(DEFAULT_PREFS), []);

    const theme = READER_THEMES[prefs.themeId];
    const fg = prefs.fg ?? theme.fg;
    const bg = prefs.bg ?? theme.bg;

    return { prefs, update, selectTheme, reset, fg, bg };
}
