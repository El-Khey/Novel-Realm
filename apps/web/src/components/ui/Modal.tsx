import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";

interface Props {
    open: boolean;
    onClose: () => void;
    title: string;
    /** Sous-titre optionnel affiché sous le titre. */
    description?: string;
    children: React.ReactNode;
}

/**
 * Modale : overlay sombre flouté + panneau centré animé. Se ferme au clic sur
 * le fond, via la croix ou avec la touche Échap. (Pas de dépendance externe.)
 */
export function Modal({ open, onClose, title, description, children }: Props) {
    useEffect(() => {
        if (!open) return;
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") onClose();
        }
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
                    onClick={onClose}
                    role="presentation"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 12, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className="relative w-full max-w-md rounded-2xl border border-border bg-popover p-6 shadow-2xl shadow-black/60"
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-label={title}
                    >
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Fermer"
                            className="absolute right-4 top-4 grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        >
                            <Icon icon={Cancel01Icon} size={16} />
                        </button>

                        <h2 className="pr-8 font-heading text-lg font-bold tracking-tight">
                            {title}
                        </h2>
                        {description && (
                            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                        )}
                        <div className="mt-4">{children}</div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
