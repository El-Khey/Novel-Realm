import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
    onCreate: (name: string) => Promise<unknown>;
    /** Appelé après une création réussie (ex. fermer la modale). */
    onSuccess?: () => void;
}

/** Petit formulaire de création d'étagère (champ nom + bouton). */
export function CreateCategoryForm({ onCreate, onSuccess }: Props) {
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
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:max-w-md">
            <div className="flex gap-2">
                <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nom de l'étagère (ex. À lire)"
                    maxLength={100}
                    aria-label="Nom de la nouvelle étagère"
                />
                <Button type="submit" disabled={pending || !name.trim()}>
                    {pending ? "Création…" : "Créer"}
                </Button>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
        </form>
    );
}
