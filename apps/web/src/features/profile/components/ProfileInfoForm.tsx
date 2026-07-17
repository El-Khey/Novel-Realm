import { useState } from "react";
import type { User } from "@/features/auth/types";
import { updateProfile } from "@/features/profile/profile.service";
import { Button } from "@/components/ui/button";

const BIO_MAX = 280;

interface Props {
    user: User;
    onUpdated: (user: User) => void;
}

/** Onglet Profil : édition du pseudo et de la bio. */
export function ProfileInfoForm({ user, onUpdated }: Props) {
    const [pseudo, setPseudo] = useState(user.pseudo);
    const [bio, setBio] = useState(user.bio ?? "");
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);

    const cleanedPseudo = pseudo.trim();
    const cleanedBio = bio.trim();
    const pseudoInvalid = cleanedPseudo.length < 3 || cleanedPseudo.length > 30;
    const dirty = cleanedPseudo !== user.pseudo || cleanedBio !== (user.bio ?? "");

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!dirty || pseudoInvalid || saving) return;

        setSaving(true);
        setStatus(null);
        try {
            const patch: { pseudo?: string; bio?: string } = {};
            if (cleanedPseudo !== user.pseudo) patch.pseudo = cleanedPseudo;
            if (cleanedBio !== (user.bio ?? "")) patch.bio = cleanedBio; // "" efface la bio
            const updated = await updateProfile(patch);
            onUpdated(updated);
            setPseudo(updated.pseudo);
            setBio(updated.bio ?? "");
            setStatus({ ok: true, message: "Profil enregistré." });
        } catch (err) {
            setStatus({
                ok: false,
                message: err instanceof Error ? err.message : "Erreur inconnue",
            });
        } finally {
            setSaving(false);
        }
    }

    return (
        <form
            onSubmit={onSubmit}
            className="space-y-5 rounded-2xl border border-border bg-card p-5 sm:p-7"
        >
            <div>
                <h2 className="font-heading text-base font-bold">Identité</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                    Votre pseudo est visible partout ; la bio n'apparaît que sur votre profil.
                </p>
            </div>

            <div className="space-y-1.5">
                <label htmlFor="profil-pseudo" className="text-sm font-medium">
                    Pseudo
                </label>
                <input
                    id="profil-pseudo"
                    value={pseudo}
                    onChange={(e) => setPseudo(e.target.value)}
                    maxLength={30}
                    aria-invalid={pseudoInvalid}
                    className="h-10 w-full max-w-sm rounded-md border border-border bg-input/30 px-3 text-sm outline-none transition-colors focus:border-ring/60 aria-[invalid=true]:border-destructive"
                />
                <p className="text-xs text-muted-foreground">
                    {pseudoInvalid ? (
                        <span className="text-destructive">Entre 3 et 30 caractères.</span>
                    ) : (
                        "Entre 3 et 30 caractères."
                    )}
                </p>
            </div>

            <div className="space-y-1.5">
                <div className="flex items-baseline justify-between gap-3">
                    <label htmlFor="profil-bio" className="text-sm font-medium">
                        Bio
                    </label>
                    <span className="text-xs tabular-nums text-muted-foreground">
                        {bio.length}/{BIO_MAX}
                    </span>
                </div>
                <textarea
                    id="profil-bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    maxLength={BIO_MAX}
                    rows={4}
                    placeholder="Quelques mots sur vous, vos genres préférés, votre novel du moment…"
                    className="w-full resize-y rounded-md border border-border bg-input/30 px-3 py-2.5 text-sm leading-relaxed outline-none transition-colors placeholder:text-muted-foreground focus:border-ring/60"
                />
            </div>

            <div className="flex items-center gap-3">
                <Button type="submit" disabled={!dirty || pseudoInvalid || saving}>
                    {saving ? "Enregistrement…" : "Enregistrer"}
                </Button>
                {dirty && !saving && (
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                            setPseudo(user.pseudo);
                            setBio(user.bio ?? "");
                            setStatus(null);
                        }}
                    >
                        Annuler
                    </Button>
                )}
                {status && (
                    <p
                        role="status"
                        className={`text-sm ${status.ok ? "text-up" : "text-destructive"}`}
                    >
                        {status.message}
                    </p>
                )}
            </div>
        </form>
    );
}
