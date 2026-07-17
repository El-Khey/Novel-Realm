import { useEffect } from "react";
import type { ReactNode } from "react";
import {
    BookOpen01Icon,
    Cancel01Icon,
    EyeIcon,
    PaintBoardIcon,
    RefreshIcon,
    TextAlignLeftIcon,
    TextAlignJustifyCenterIcon,
    TextFontIcon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import {
    GAP_RANGE,
    LEADING_RANGE,
    READER_FONTS,
    READER_THEMES,
    READER_WEIGHTS,
    READER_WIDTHS,
    SIZE_RANGE,
    type ReaderFontId,
    type ReaderPrefs,
    type ReaderThemeId,
    type ReaderWidthId,
} from "@/features/reader/useReaderPrefs";

interface Props {
    open: boolean;
    onClose: () => void;
    prefs: ReaderPrefs;
    update: <K extends keyof ReaderPrefs>(key: K, value: ReaderPrefs[K]) => void;
    selectTheme: (id: ReaderThemeId) => void;
    reset: () => void;
    fg: string;
    bg: string;
}

const THEME_IDS = Object.keys(READER_THEMES) as ReaderThemeId[];
const FONT_IDS = Object.keys(READER_FONTS) as ReaderFontId[];
const WIDTH_IDS = Object.keys(READER_WIDTHS) as ReaderWidthId[];

/** Panneau latéral de réglages du lecteur (thème sombre de l'app, accents cramoisis). */
export function ReaderSettings({ open, onClose, prefs, update, selectTheme, reset, fg, bg }: Props) {
    // Échap ferme le panneau.
    useEffect(() => {
        if (!open) return;
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") onClose();
        }
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    const isCustom = prefs.fg !== null || prefs.bg !== null;

    return (
        <div className={cn("dark fixed inset-0 z-50", !open && "pointer-events-none")} aria-hidden={!open}>
            {/* Voile */}
            <div
                onClick={onClose}
                className={cn(
                    "absolute inset-0 bg-black/50 transition-opacity duration-300 motion-reduce:transition-none",
                    open ? "opacity-100" : "opacity-0",
                )}
            />

            {/* Panneau */}
            <aside
                role="dialog"
                aria-modal="true"
                aria-label="Réglages de lecture"
                className={cn(
                    "absolute right-0 top-0 flex h-full w-[22rem] max-w-[88vw] flex-col border-l border-border bg-popover text-foreground shadow-2xl transition-transform duration-300 motion-reduce:transition-none",
                    open ? "translate-x-0" : "translate-x-full",
                )}
            >
                <header className="flex items-center justify-between border-b border-border px-5 py-4">
                    <h2 className="font-heading text-lg font-bold">Affichage</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Fermer les réglages"
                        className="grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                        <Icon icon={Cancel01Icon} size={18} />
                    </button>
                </header>

                <div className="flex-1 space-y-7 overflow-y-auto px-5 py-6">
                    {/* THÈME + couleurs */}
                    <Section icon={PaintBoardIcon} title="Thème">
                        <div className="grid grid-cols-2 gap-2">
                            {THEME_IDS.map((id) => {
                                const t = READER_THEMES[id];
                                const active = prefs.themeId === id && !isCustom;
                                return (
                                    <button
                                        key={id}
                                        type="button"
                                        onClick={() => selectTheme(id)}
                                        aria-pressed={active}
                                        className={cn(
                                            "flex items-center gap-2 rounded-lg border p-2 transition-colors",
                                            active
                                                ? "border-primary ring-1 ring-primary"
                                                : "border-border hover:border-primary/40",
                                        )}
                                    >
                                        <span
                                            className="grid size-8 shrink-0 place-items-center rounded-md text-sm font-semibold ring-1 ring-white/10"
                                            style={{ background: t.bg, color: t.fg }}
                                        >
                                            Aa
                                        </span>
                                        <span className="text-sm">{t.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <ColorField label="Texte" value={fg} onChange={(c) => update("fg", c)} />
                            <ColorField label="Fond" value={bg} onChange={(c) => update("bg", c)} />
                        </div>
                        {isCustom && (
                            <button
                                type="button"
                                onClick={() => selectTheme(prefs.themeId)}
                                className="text-xs font-medium text-primary hover:underline"
                            >
                                Revenir aux couleurs du thème
                            </button>
                        )}
                    </Section>

                    {/* TYPOGRAPHIE */}
                    <Section icon={TextFontIcon} title="Typographie">
                        <PillGroup
                            columns={3}
                            value={prefs.fontId}
                            onChange={(v) => update("fontId", v)}
                            options={FONT_IDS.map((id) => ({ label: READER_FONTS[id].label, value: id }))}
                        />
                        <Range
                            label="Taille"
                            display={`${prefs.fontSize} px`}
                            value={prefs.fontSize}
                            {...SIZE_RANGE}
                            onChange={(v) => update("fontSize", v)}
                        />
                        <Range
                            label="Interligne"
                            display={prefs.lineHeight.toFixed(1)}
                            value={prefs.lineHeight}
                            {...LEADING_RANGE}
                            onChange={(v) => update("lineHeight", Math.round(v * 10) / 10)}
                        />
                        <Range
                            label="Espacement des paragraphes"
                            display={prefs.paragraphGap.toFixed(1)}
                            value={prefs.paragraphGap}
                            {...GAP_RANGE}
                            onChange={(v) => update("paragraphGap", Math.round(v * 10) / 10)}
                        />
                        <div>
                            <p className="mb-2 text-sm font-medium">Graisse</p>
                            <PillGroup
                                columns={3}
                                value={prefs.fontWeight}
                                onChange={(v) => update("fontWeight", v)}
                                options={READER_WEIGHTS.map((w) => ({ label: w.label, value: w.value }))}
                            />
                        </div>
                        <div>
                            <p className="mb-2 text-sm font-medium">Alignement</p>
                            <PillGroup
                                columns={2}
                                value={prefs.justify}
                                onChange={(v) => update("justify", v)}
                                options={[
                                    { label: <AlignLabel icon={TextAlignLeftIcon} text="Gauche" />, value: false },
                                    {
                                        label: <AlignLabel icon={TextAlignJustifyCenterIcon} text="Justifié" />,
                                        value: true,
                                    },
                                ]}
                            />
                        </div>
                    </Section>

                    {/* MISE EN PAGE */}
                    <Section icon={BookOpen01Icon} title="Mise en page">
                        <PillGroup
                            columns={2}
                            value={prefs.widthId}
                            onChange={(v) => update("widthId", v)}
                            options={WIDTH_IDS.map((id) => ({ label: READER_WIDTHS[id].label, value: id }))}
                        />
                    </Section>

                    {/* CONFORT */}
                    <Section icon={EyeIcon} title="Confort">
                        <Toggle
                            label="Mode focus (masque l'en-tête)"
                            checked={prefs.focusMode}
                            onChange={(v) => update("focusMode", v)}
                        />
                    </Section>
                </div>

                <footer className="border-t border-border px-5 py-4">
                    <button
                        type="button"
                        onClick={reset}
                        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <Icon icon={RefreshIcon} size={16} />
                        Réinitialiser les réglages
                    </button>
                </footer>
            </aside>
        </div>
    );
}

/* --------------------------- sous-composants --------------------------- */

function Section({ icon, title, children }: { icon: IconSvgElement; title: string; children: ReactNode }) {
    return (
        <section className="space-y-3">
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Icon icon={icon} size={15} />
                {title}
            </h3>
            {children}
        </section>
    );
}

function PillGroup<T extends string | number | boolean>({
    options,
    value,
    onChange,
    columns,
}: {
    options: { label: ReactNode; value: T }[];
    value: T;
    onChange: (v: T) => void;
    columns: 2 | 3 | 4;
}) {
    return (
        <div
            className={cn(
                "grid gap-2",
                columns === 2 && "grid-cols-2",
                columns === 3 && "grid-cols-3",
                columns === 4 && "grid-cols-4",
            )}
        >
            {options.map((o) => (
                <button
                    key={String(o.value)}
                    type="button"
                    aria-pressed={o.value === value}
                    onClick={() => onChange(o.value)}
                    className={cn(
                        "inline-flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-sm font-medium transition-colors",
                        o.value === value
                            ? "border-primary bg-primary/12 text-foreground"
                            : "border-border text-muted-foreground hover:bg-secondary hover:text-foreground",
                    )}
                >
                    {o.label}
                </button>
            ))}
        </div>
    );
}

function Range({
    label,
    display,
    value,
    min,
    max,
    step,
    onChange,
}: {
    label: string;
    display: string;
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (v: number) => void;
}) {
    return (
        <div>
            <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">{label}</span>
                <span className="text-xs tabular-nums text-muted-foreground">{display}</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                aria-label={label}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-primary"
            />
        </div>
    );
}

function ColorField({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (c: string) => void;
}) {
    return (
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border p-2">
            <input
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                aria-label={`Couleur du ${label.toLowerCase()}`}
                className="size-7 shrink-0 cursor-pointer rounded bg-transparent"
            />
            <span className="text-sm text-muted-foreground">{label}</span>
        </label>
    );
}

function Toggle({
    label,
    checked,
    onChange,
}: {
    label: string;
    checked: boolean;
    onChange: (v: boolean) => void;
}) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className="flex w-full items-center justify-between gap-3"
        >
            <span className="text-sm font-medium">{label}</span>
            <span
                className={cn(
                    "relative h-6 w-11 shrink-0 rounded-full transition-colors",
                    checked ? "bg-primary" : "bg-secondary",
                )}
            >
                <span
                    className={cn(
                        "absolute top-0.5 size-5 rounded-full bg-white transition-transform motion-reduce:transition-none",
                        checked ? "translate-x-5" : "translate-x-0.5",
                    )}
                />
            </span>
        </button>
    );
}

function AlignLabel({ icon, text }: { icon: IconSvgElement; text: string }) {
    return (
        <>
            <Icon icon={icon} size={16} />
            {text}
        </>
    );
}
