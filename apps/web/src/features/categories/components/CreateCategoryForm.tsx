import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Props {
    onCreate: (name: string) => Promise<unknown>;
    /** Appelé après une création réussie (ex. fermer la modale). */
    onSuccess?: () => void;
    /** Appelé quand l'utilisateur annule (affiche le bouton si présent). */
    onCancel?: () => void;
}

/** Formulaire de création d'étagère (pensé pour vivre dans la modale). */
export function CreateCategoryForm({ onCreate, onSuccess, onCancel }: Props) {
    const [name, setName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [pending, setPending] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) return;

        setPending(true);
        setError(null);
        try {
            await onCreate(trimmed);
            setName(""); // succès → on vide le champ
            onSuccess?.();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur inconnue");
        } finally {
            setPending(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex. Coups de cœur, À relire…"
                    maxLength={100}
                    autoFocus
                    aria-label="Nom de la nouvelle étagère"
                    className="h-11 w-full rounded-xl border border-transparent bg-secondary px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring/60 focus:bg-input"
                />
                {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
            </div>

            <div className="flex justify-end gap-2">
                {onCancel && (
                    <Button
                        type="button"
                        variant="ghost"
                        className="rounded-full"
                        onClick={onCancel}
                    >
                        Annuler
                    </Button>
                )}
                <Button
                    type="submit"
                    disabled={pending || !name.trim()}
                    className="rounded-full px-5"
                >
                    {pending ? "Création…" : "Créer l'étagère"}
                </Button>
            </div>
        </form>
    );
}
