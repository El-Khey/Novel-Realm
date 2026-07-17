import { useState } from "react";
import { BookOpen01Icon, PaintBoardIcon, RefreshIcon } from "@hugeicons/core-free-icons";
import { ACCENTS, setAccent, useAccent } from "@/features/profile/accent";
import {
    getStoredReaderPrefs,
    resetReaderPreferences,
    schedulePreferencesSync,
} from "@/features/profile/preferences";
import {
    DEFAULT_PREFS,
    READER_FONTS,
    READER_THEMES,
    READER_WIDTHS,
    type ReaderPrefs,
} from "@/features/reader/useReaderPrefs";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

/**
 * Onglet Apparence : couleur d'accent de l'app + réglages de lecture (partagés
 * avec le lecteur configurable #21, synchronisés avec le compte).
 */
export function AppearanceSettings() {
    const accent = useAccent();
    // Nonce pour relire le localStorage après une réinitialisation.
    const [readerNonce, setReaderNonce] = useState(0);

    const reader: ReaderPrefs = {
        ...DEFAULT_PREFS,
        ...(getStoredReaderPrefs() as Partial<ReaderPrefs> | null),
    };
    const hasCustomReader = getStoredReaderPrefs() !== null;
    void readerNonce;

    // Indexations tolérantes : les valeurs viennent du localStorage (potentiellement corrompues).
    const themeLabel =
        (READER_THEMES as Record<string, { label: string }>)[reader.themeId]?.label ?? "—";
    const fontLabel =
        (READER_FONTS as Record<string, { label: string }>)[reader.fontId]?.label ?? "—";
    const widthLabel =
        (READER_WIDTHS as Record<string, { label: string }>)[reader.widthId]?.label ?? "—";

    return (
        <div className="space-y-5">
            {/* Accent */}
            <section className="rounded-2xl border border-border bg-card p-5 sm:p-7">
                <h2 className="flex items-center gap-2 font-heading text-base font-bold">
                    <Icon icon={PaintBoardIcon} size={17} />
                    Couleur d'accent
                </h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                    Appliquée à toute l'application (boutons, liens, jauges…) et mémorisée sur votre
                    compte.
                </p>

                <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
                    {ACCENTS.map((a) => {
                        const active = a.id === accent;
                        return (
                            <button
                                key={a.id}
                                type="button"
                                aria-pressed={active}
                                onClick={() => {
                                    setAccent(a.id);
                                    schedulePreferencesSync(400);
                                }}
                                className={cn(
                                    "flex flex-col items-center gap-2 rounded-xl border p-3 transition-colors",
                                    active
                                        ? "border-primary ring-1 ring-primary"
                                        : "border-border hover:border-primary/40",
                                )}
                            >
                                <span
                                    className="size-7 rounded-full ring-1 ring-white/15"
                                    style={{ background: a.primary }}
                                />
                                <span className="text-xs font-medium">{a.label}</span>
                            </button>
                        );
                    })}
                </div>

                <p className="mt-4 text-xs text-muted-foreground">
                    Le thème sombre fait partie de l'identité de Novel Realm — les thèmes clairs
                    (Clair, Sépia…) existent là où ils comptent : dans le lecteur.
                </p>
            </section>

            {/* Lecture */}
            <section className="rounded-2xl border border-border bg-card p-5 sm:p-7">
                <h2 className="flex items-center gap-2 font-heading text-base font-bold">
                    <Icon icon={BookOpen01Icon} size={17} />
                    Réglages de lecture
                </h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                    Modifiables pendant la lecture (bouton ⚙️ du lecteur) et synchronisés avec votre
                    compte — vous les retrouvez sur tous vos appareils.
                </p>

                <dl className="mt-4 flex flex-wrap gap-2">
                    <ReaderChip label="Thème" value={themeLabel} />
                    <ReaderChip label="Police" value={fontLabel} />
                    <ReaderChip label="Taille" value={`${reader.fontSize} px`} />
                    <ReaderChip label="Interligne" value={reader.lineHeight.toFixed(1)} />
                    <ReaderChip label="Largeur" value={widthLabel} />
                    <ReaderChip label="Alignement" value={reader.justify ? "Justifié" : "Gauche"} />
                </dl>

                <div className="mt-4">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={!hasCustomReader}
                        onClick={() => {
                            resetReaderPreferences();
                            setReaderNonce((n) => n + 1);
                        }}
                    >
                        <Icon icon={RefreshIcon} size={15} />
                        Réinitialiser les réglages de lecture
                    </Button>
                    {!hasCustomReader && (
                        <p className="mt-2 text-xs text-muted-foreground">
                            Vous utilisez les réglages par défaut.
                        </p>
                    )}
                </div>
            </section>
        </div>
    );
}

function ReaderChip({ label, value }: { label: string; value: string }) {
    return (
        <div className="inline-flex items-baseline gap-1.5 rounded-full border border-border bg-secondary/40 px-3 py-1.5">
            <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {label}
            </dt>
            <dd className="text-xs font-semibold">{value}</dd>
        </div>
    );
}
