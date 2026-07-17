import { useSyncExternalStore } from "react";

/**
 * Couleur d'accent de l'application (issue #17 — personnalisation).
 *
 * L'accent est appliqué en surchargeant les variables `--primary`,
 * `--primary-active`, `--primary-foreground` et `--ring` via une feuille de
 * style injectée APRÈS le CSS du build (elle gagne donc sur `:root` et `.dark`
 * de index.css). Tout ce qui utilise les utilitaires `bg-primary`,
 * `text-primary`, `ring`… suit automatiquement — lecteur compris.
 */

export type AccentId = "crimson" | "ember" | "amber" | "emerald" | "azure" | "violet";

export interface Accent {
    id: AccentId;
    label: string;
    primary: string;
    active: string;
    /** Couleur du texte posé sur l'accent (boutons) — sombre pour les accents clairs. */
    foreground: string;
}

export const ACCENTS: Accent[] = [
    { id: "crimson", label: "Cramoisi", primary: "#f43f5e", active: "#e11d48", foreground: "#ffffff" },
    { id: "ember", label: "Braise", primary: "#f97316", active: "#ea580c", foreground: "#1c0f05" },
    { id: "amber", label: "Ambre", primary: "#f5b301", active: "#d99e00", foreground: "#201503" },
    { id: "emerald", label: "Émeraude", primary: "#10b981", active: "#059669", foreground: "#04211a" },
    { id: "azure", label: "Azur", primary: "#3b82f6", active: "#2563eb", foreground: "#ffffff" },
    { id: "violet", label: "Violet", primary: "#8b5cf6", active: "#7c3aed", foreground: "#ffffff" },
];

export const DEFAULT_ACCENT: AccentId = "crimson";

const STORAGE_KEY = "app-accent";
const STYLE_ID = "accent-vars";
const CHANGE_EVENT = "nr-accent-change";

export function isAccentId(value: unknown): value is AccentId {
    return typeof value === "string" && ACCENTS.some((a) => a.id === value);
}

/** Accent mémorisé sur cet appareil (défaut : cramoisi). */
export function getStoredAccent(): AccentId {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return isAccentId(raw) ? raw : DEFAULT_ACCENT;
    } catch {
        return DEFAULT_ACCENT;
    }
}

/** Applique l'accent au document (sans le persister). */
export function applyAccent(id: AccentId): void {
    const existing = document.getElementById(STYLE_ID);

    if (id === DEFAULT_ACCENT) {
        existing?.remove(); // le CSS du build reprend la main (cramoisi)
        return;
    }

    const accent = ACCENTS.find((a) => a.id === id) ?? ACCENTS[0];
    const vars =
        `--primary:${accent.primary};` +
        `--primary-active:${accent.active};` +
        `--primary-foreground:${accent.foreground};` +
        `--ring:${accent.primary};`;

    const style = existing ?? document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `:root{${vars}}.dark{${vars}}`;
    if (!existing) document.head.appendChild(style);
}

/** Change l'accent : persiste, applique, notifie les composants abonnés. */
export function setAccent(id: AccentId): void {
    try {
        localStorage.setItem(STORAGE_KEY, id);
    } catch {
        /* navigation privée : l'accent vivra le temps de la session */
    }
    applyAccent(id);
    window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** À appeler une fois au démarrage de l'app (avant le rendu). */
export function initAccent(): void {
    applyAccent(getStoredAccent());
}

function subscribe(callback: () => void) {
    window.addEventListener(CHANGE_EVENT, callback);
    return () => window.removeEventListener(CHANGE_EVENT, callback);
}

/** Accent courant, réactif (pour le sélecteur de la page profil). */
export function useAccent(): AccentId {
    return useSyncExternalStore(subscribe, getStoredAccent, () => DEFAULT_ACCENT);
}
