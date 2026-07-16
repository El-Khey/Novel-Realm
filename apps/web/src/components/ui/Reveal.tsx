import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

interface RevealProps {
    children: ReactNode;
    className?: string;
    /** Décalage d'apparition (en secondes) pour orchestrer plusieurs blocs. */
    delay?: number;
    /** Amplitude de la translation verticale initiale (px). */
    y?: number;
}

/**
 * Apparition douce quand l'élément entre dans le viewport (une seule fois).
 * Respecte `prefers-reduced-motion` : rend statiquement si l'utilisateur
 * a désactivé les animations.
 */
export function Reveal({ children, className, delay = 0, y = 16 }: RevealProps) {
    const reduce = useReducedMotion();

    if (reduce) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, y }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
        >
            {children}
        </motion.div>
    );
}
