import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Props {
    /** Le roman est-il déjà dans la bibliothèque de l'utilisateur ? */
    inLibrary: boolean;
    /** Action d'ajout (renvoyée par useLibrary). */
    onAdd: () => Promise<unknown>;
}

/**
 * Petit contrôle d'ajout à la bibliothèque, pensé pour se poser en coin d'une
 * carte de roman. Gère son propre état « en cours » et bascule sur une pastille
 * « Ajouté » une fois le roman présent en bibliothèque.
 */
export function AddToLibraryButton({ inLibrary, onAdd }: Props) {
    const [pending, setPending] = useState(false);

    if (inLibrary) {
        return <Badge variant="secondary">✓ Ajouté</Badge>;
    }

    async function handleClick() {
        setPending(true);
        try {
            await onAdd();
        } catch {
            // En cas d'échec on réaffiche simplement le bouton (temporaire — pas de toast).
        } finally {
            setPending(false);
        }
    }

    return (
        <Button size="xs" onClick={handleClick} disabled={pending}>
            {pending ? "Ajout…" : "+ Ajouter"}
        </Button>
    );
}
