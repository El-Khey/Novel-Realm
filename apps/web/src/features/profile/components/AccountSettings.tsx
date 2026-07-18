import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Alert02Icon,
    Delete02Icon,
    GoogleIcon,
    Logout01Icon,
    Mail01Icon,
    SquareLock01Icon,
    ViewIcon,
    ViewOffIcon,
} from "@hugeicons/core-free-icons";
import type { User } from "@/features/auth/types";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { changePassword, deleteAccount } from "@/features/profile/profile.service";
import { ApiError } from "@/lib/http";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

interface Props {
    user: User;
}

/** Onglet Compte : informations, changement de mot de passe, déconnexion. */
export function AccountSettings({ user }: Props) {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const memberSince = new Date(user.createdAt).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    async function handleLogout() {
        await logout();
        navigate("/login");
    }

    return (
        <div className="space-y-5">
            {/* Informations */}
            <section className="rounded-2xl border border-border bg-card p-5 sm:p-7">
                <h2 className="flex items-center gap-2 font-heading text-base font-bold">
                    <Icon icon={Mail01Icon} size={17} />
                    Informations du compte
                </h2>
                <dl className="mt-4 divide-y divide-border text-sm">
                    <InfoRow label="Adresse e-mail" value={user.email} hint="Non modifiable" />
                    <InfoRow
                        label="Type de compte"
                        value={user.provider === "GOOGLE" ? "Compte Google" : "Compte local"}
                    />
                    <InfoRow label="Membre depuis" value={memberSince} />
                </dl>
            </section>

            {/* Mot de passe */}
            <section className="rounded-2xl border border-border bg-card p-5 sm:p-7">
                <h2 className="flex items-center gap-2 font-heading text-base font-bold">
                    <Icon icon={SquareLock01Icon} size={17} />
                    Mot de passe
                </h2>
                {user.provider === "GOOGLE" ? (
                    <div className="mt-4 flex items-start gap-3 rounded-xl border border-border bg-secondary/40 p-4">
                        <Icon icon={GoogleIcon} size={18} className="mt-0.5 shrink-0 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                            Vous vous connectez avec Google : votre mot de passe se gère directement
                            depuis votre compte Google.
                        </p>
                    </div>
                ) : (
                    <PasswordForm />
                )}
            </section>

            {/* Session */}
            <section className="rounded-2xl border border-border bg-card p-5 sm:p-7">
                <h2 className="flex items-center gap-2 font-heading text-base font-bold">
                    <Icon icon={Logout01Icon} size={17} />
                    Session
                </h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                    Vous déconnecte de cet appareil. Vos préférences restent attachées à votre compte.
                </p>
                <Button variant="destructive" className="mt-4" onClick={() => void handleLogout()}>
                    <Icon icon={Logout01Icon} size={16} />
                    Se déconnecter
                </Button>
            </section>

            {/* Zone de danger */}
            <DangerZone user={user} />
        </div>
    );
}

/* --------------------------- zone de danger --------------------------- */

/**
 * Suppression définitive du compte. Double garde-fou contre le clic malheureux :
 * une modale de confirmation, dans laquelle il faut RECOPIER son pseudo pour
 * débloquer le bouton (même principe que GitHub).
 */
function DangerZone({ user }: { user: User }) {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const [open, setOpen] = useState(false);
    const [confirmText, setConfirmText] = useState("");
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const matches = confirmText.trim() === user.pseudo;

    function close() {
        setOpen(false);
        setConfirmText("");
        setError(null);
    }

    async function handleDelete() {
        if (!matches || deleting) return;
        setDeleting(true);
        setError(null);
        try {
            await deleteAccount();
            // Le serveur a déjà fermé la session ; on nettoie l'état local.
            await logout();
            navigate("/login", { replace: true });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur inconnue");
            setDeleting(false);
        }
    }

    return (
        <>
            <section className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 sm:p-7">
                <h2 className="flex items-center gap-2 font-heading text-base font-bold text-destructive">
                    <Icon icon={Alert02Icon} size={17} />
                    Zone de danger
                </h2>
                <p className="mt-0.5 max-w-prose text-sm text-muted-foreground">
                    La suppression de votre compte est <strong className="text-foreground">définitive</strong>.
                    Votre bibliothèque, vos étagères, votre progression de lecture, vos favoris et vos
                    avis seront effacés. Cette action ne peut pas être annulée.
                </p>
                <Button variant="destructive" className="mt-4" onClick={() => setOpen(true)}>
                    <Icon icon={Delete02Icon} size={16} />
                    Supprimer mon compte
                </Button>
            </section>

            <Modal
                open={open}
                onClose={close}
                title="Supprimer définitivement votre compte ?"
                description="Cette action est irréversible — il n'y a aucun moyen de récupérer vos données ensuite."
            >
                <div className="space-y-4">
                    <ul className="space-y-1.5 rounded-xl border border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
                        <li>• Vos romans suivis et vos étagères</li>
                        <li>• Votre progression de lecture et votre historique</li>
                        <li>• Vos chapitres favoris et vos avis</li>
                        <li>• Votre avatar, votre bannière et vos préférences</li>
                    </ul>

                    <div className="space-y-1.5">
                        <label htmlFor="confirm-suppression" className="block text-sm">
                            Pour confirmer, saisissez{" "}
                            <span className="font-semibold text-foreground">{user.pseudo}</span> :
                        </label>
                        <input
                            id="confirm-suppression"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            autoComplete="off"
                            placeholder={user.pseudo}
                            className="h-11 w-full rounded-xl border border-transparent bg-secondary px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-destructive/60 focus:bg-input"
                        />
                    </div>

                    {error && (
                        <p role="alert" className="text-sm text-destructive">
                            {error}
                        </p>
                    )}

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="ghost" className="rounded-full" onClick={close}>
                            Annuler
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            disabled={!matches || deleting}
                            className="rounded-full px-5"
                            onClick={() => void handleDelete()}
                        >
                            {deleting ? "Suppression…" : "Supprimer définitivement"}
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}

/* ---------------------------- mot de passe ---------------------------- */

function PasswordForm() {
    const [current, setCurrent] = useState("");
    const [next, setNext] = useState("");
    const [confirm, setConfirm] = useState("");
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);

    const tooShort = next.length > 0 && next.length < 8;
    const mismatch = confirm.length > 0 && next !== confirm;
    const ready = current.length > 0 && next.length >= 8 && next === confirm && !saving;

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!ready) return;

        setSaving(true);
        setStatus(null);
        try {
            await changePassword(current, next);
            setCurrent("");
            setNext("");
            setConfirm("");
            setStatus({ ok: true, message: "Mot de passe modifié." });
        } catch (err) {
            const message =
                err instanceof ApiError && err.status === 401
                    ? "Mot de passe actuel incorrect."
                    : err instanceof Error
                      ? err.message
                      : "Erreur inconnue";
            setStatus({ ok: false, message });
        } finally {
            setSaving(false);
        }
    }

    return (
        <form onSubmit={onSubmit} className="mt-4 max-w-sm space-y-4">
            <PasswordField
                id="mdp-actuel"
                label="Mot de passe actuel"
                value={current}
                onChange={setCurrent}
                autoComplete="current-password"
            />
            <PasswordField
                id="mdp-nouveau"
                label="Nouveau mot de passe"
                value={next}
                onChange={setNext}
                autoComplete="new-password"
                error={tooShort ? "Au moins 8 caractères." : null}
            />
            <PasswordField
                id="mdp-confirme"
                label="Confirmer le nouveau mot de passe"
                value={confirm}
                onChange={setConfirm}
                autoComplete="new-password"
                error={mismatch ? "Les deux mots de passe ne correspondent pas." : null}
            />

            <div className="flex items-center gap-3">
                <Button type="submit" disabled={!ready}>
                    {saving ? "Modification…" : "Modifier le mot de passe"}
                </Button>
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

function PasswordField({
    id,
    label,
    value,
    onChange,
    autoComplete,
    error,
}: {
    id: string;
    label: string;
    value: string;
    onChange: (v: string) => void;
    autoComplete: string;
    error?: string | null;
}) {
    const [visible, setVisible] = useState(false);

    return (
        <div className="space-y-1.5">
            <label htmlFor={id} className="text-sm font-medium">
                {label}
            </label>
            <div className="relative">
                <input
                    id={id}
                    type={visible ? "text" : "password"}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    autoComplete={autoComplete}
                    aria-invalid={Boolean(error)}
                    className="h-10 w-full rounded-md border border-border bg-input/30 px-3 pr-10 text-sm outline-none transition-colors focus:border-ring/60 aria-[invalid=true]:border-destructive"
                />
                <button
                    type="button"
                    onClick={() => setVisible((v) => !v)}
                    aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    className="absolute right-1.5 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded text-muted-foreground transition-colors hover:text-foreground"
                >
                    <Icon icon={visible ? ViewOffIcon : ViewIcon} size={16} />
                </button>
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}

function InfoRow({ label, value, hint }: { label: string; value: string; hint?: string }) {
    return (
        <div className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="flex items-baseline gap-2 truncate text-right">
                <span className="truncate font-medium">{value}</span>
                {hint && <span className="shrink-0 text-xs text-muted-foreground">{hint}</span>}
            </dd>
        </div>
    );
}
