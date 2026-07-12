import { useEffect } from "react";

interface Props {
    open: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

/**
 * Modale minimale : overlay sombre + panneau centré. Se ferme au clic sur le
 * fond ou avec la touche Échap. (Pas de dépendance externe.)
 */
export function Modal({ open, onClose, title, children }: Props) {
    useEffect(() => {
        if (!open) return;
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") onClose();
        }
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"
            onClick={onClose}
            role="presentation"
        >
            <div
                className="w-full max-w-sm rounded-xl border border-border bg-background p-5 shadow-xl"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label={title}
            >
                <h2 className="mb-4 text-lg font-semibold">{title}</h2>
                {children}
            </div>
        </div>
    );
}
