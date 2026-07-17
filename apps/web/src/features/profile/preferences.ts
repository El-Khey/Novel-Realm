import { getStoredAccent, isAccentId, setAccent } from "./accent";
import { updateProfile } from "./profile.service";

/**
 * Synchronisation des préférences avec le compte (issue #17, partagée avec le
 * lecteur configurable #21).
 *
 * Modèle : le localStorage reste la source de vérité IMMÉDIATE (zéro latence),
 * le serveur en garde une copie. À la connexion, la copie serveur ré-hydrate
 * l'appareil ; à chaque changement (accent, réglages du lecteur), on pousse en
 * arrière-plan (debounce, best-effort).
 */

/** Forme des préférences stockées côté serveur (JSON opaque pour l'API). */
export interface AppPreferences {
    accent?: string;
    reader?: unknown;
}

// Même clé que STORAGE_KEY dans features/reader/useReaderPrefs.ts.
const READER_PREFS_KEY = "reader-prefs";

/** Préférences actuelles de l'appareil (accent + réglages du lecteur). */
export function buildPreferences(): AppPreferences {
    let reader: unknown;
    try {
        const raw = localStorage.getItem(READER_PREFS_KEY);
        reader = raw ? (JSON.parse(raw) as unknown) : undefined;
    } catch {
        reader = undefined;
    }
    return { accent: getStoredAccent(), reader };
}

let syncTimer: ReturnType<typeof setTimeout> | undefined;

/**
 * Pousse les préférences vers le serveur, débouncé (les curseurs du lecteur
 * déclenchent des rafales). Best-effort : une erreur réseau est ignorée, le
 * localStorage garde la main.
 */
export function schedulePreferencesSync(delayMs = 1500): void {
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => {
        updateProfile({ preferences: buildPreferences() }).catch(() => {
            /* hors-ligne / session expirée : on réessaiera au prochain changement */
        });
    }, delayMs);
}

/** Réinitialise les réglages du lecteur (appareil + serveur). */
export function resetReaderPreferences(): void {
    try {
        localStorage.removeItem(READER_PREFS_KEY);
    } catch {
        /* rien à faire */
    }
    schedulePreferencesSync(300);
}

/** Réglages bruts du lecteur stockés sur l'appareil (null si aucun). */
export function getStoredReaderPrefs(): Record<string, unknown> | null {
    try {
        const raw = localStorage.getItem(READER_PREFS_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as unknown;
        return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
    } catch {
        return null;
    }
}

/**
 * Applique les préférences du compte à cet appareil (au login / au démarrage).
 * Si le serveur n'a encore rien et que l'appareil a des réglages, on pousse
 * une première copie (migration douce des réglages pré-existants).
 */
export function hydratePreferences(preferences: unknown): void {
    if (!preferences || typeof preferences !== "object") {
        if (getStoredReaderPrefs() !== null) schedulePreferencesSync(500);
        return;
    }

    const prefs = preferences as AppPreferences;

    if (prefs.reader && typeof prefs.reader === "object") {
        try {
            localStorage.setItem(READER_PREFS_KEY, JSON.stringify(prefs.reader));
        } catch {
            /* stockage plein : tant pis, défauts du lecteur */
        }
    }
    if (isAccentId(prefs.accent)) {
        setAccent(prefs.accent);
    }
}
