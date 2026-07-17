import { useEffect, useRef, useState } from "react";
import {
    Calendar03Icon,
    Camera01Icon,
    Delete02Icon,
    GoogleIcon,
    ImageAdd01Icon,
    Upload01Icon,
} from "@hugeicons/core-free-icons";
import type { User } from "@/features/auth/types";
import {
    deleteAvatar,
    deleteBanner,
    uploadAvatar,
    uploadBanner,
} from "@/features/profile/profile.service";
import { UserAvatar } from "@/features/profile/components/UserAvatar";
import { StatsStrip } from "@/features/profile/components/StatsStrip";
import { assetUrl } from "@/lib/http";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const ACCEPT_ATTR = ACCEPTED_TYPES.join(",");
const AVATAR_MAX = 2 * 1024 * 1024; // 2 Mo
const BANNER_MAX = 4 * 1024 * 1024; // 4 Mo

interface Props {
    user: User;
    onUpdated: (user: User) => void;
}

/**
 * En-tête du profil : bannière (importable), avatar (importable), identité
 * (pseudo, type de compte, ancienneté, bio) et statistiques résumées.
 */
export function ProfileHeader({ user, onUpdated }: Props) {
    const [busy, setBusy] = useState<"avatar" | "banner" | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [avatarMenu, setAvatarMenu] = useState(false);
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);
    const avatarMenuRef = useRef<HTMLDivElement>(null);

    // Ferme le menu avatar au clic à l'extérieur.
    useEffect(() => {
        if (!avatarMenu) return;
        function onClick(e: MouseEvent) {
            if (avatarMenuRef.current && !avatarMenuRef.current.contains(e.target as Node)) {
                setAvatarMenu(false);
            }
        }
        document.addEventListener("mousedown", onClick);
        return () => document.removeEventListener("mousedown", onClick);
    }, [avatarMenu]);

    function validate(file: File, maxBytes: number, maxLabel: string): string | null {
        if (!ACCEPTED_TYPES.includes(file.type)) return "Format non pris en charge (JPG, PNG ou WebP)";
        if (file.size > maxBytes) return `Fichier trop volumineux (max ${maxLabel})`;
        return null;
    }

    async function run(kind: "avatar" | "banner", action: () => Promise<User>) {
        setBusy(kind);
        setError(null);
        try {
            onUpdated(await action());
        } catch (e) {
            setError(e instanceof Error ? e.message : "Erreur inconnue");
        } finally {
            setBusy(null);
        }
    }

    function onAvatarPicked(file: File | undefined) {
        if (!file) return;
        const invalid = validate(file, AVATAR_MAX, "2 Mo");
        if (invalid) return setError(invalid);
        void run("avatar", () => uploadAvatar(file));
    }

    function onBannerPicked(file: File | undefined) {
        if (!file) return;
        const invalid = validate(file, BANNER_MAX, "4 Mo");
        if (invalid) return setError(invalid);
        void run("banner", () => uploadBanner(file));
    }

    const memberSince = new Date(user.createdAt).toLocaleDateString("fr-FR", {
        month: "long",
        year: "numeric",
    });

    return (
        <section className="overflow-hidden rounded-2xl border border-border bg-card">
            {/* Entrées fichier cachées */}
            <input
                ref={avatarInputRef}
                type="file"
                accept={ACCEPT_ATTR}
                className="hidden"
                onChange={(e) => {
                    onAvatarPicked(e.target.files?.[0]);
                    e.target.value = "";
                }}
            />
            <input
                ref={bannerInputRef}
                type="file"
                accept={ACCEPT_ATTR}
                className="hidden"
                onChange={(e) => {
                    onBannerPicked(e.target.files?.[0]);
                    e.target.value = "";
                }}
            />

            {/* Bannière */}
            <div className="relative h-40 sm:h-52">
                {user.bannerUrl ? (
                    <img
                        src={assetUrl(user.bannerUrl)}
                        alt=""
                        className="absolute inset-0 size-full object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 bg-linear-to-br from-primary/30 via-primary/10 to-secondary" />
                )}
                <div className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-black/45 to-transparent" />

                <div className="absolute right-3 top-3 flex gap-2">
                    <BannerButton
                        icon={ImageAdd01Icon}
                        onClick={() => bannerInputRef.current?.click()}
                        disabled={busy !== null}
                    >
                        {busy === "banner" ? "Envoi…" : user.bannerUrl ? "Changer la bannière" : "Ajouter une bannière"}
                    </BannerButton>
                    {user.bannerUrl && (
                        <BannerButton
                            icon={Delete02Icon}
                            label="Supprimer la bannière"
                            onClick={() => void run("banner", deleteBanner)}
                            disabled={busy !== null}
                        />
                    )}
                </div>
            </div>

            {/* Identité */}
            <div className="px-5 pb-5 sm:px-7 sm:pb-6">
                {/* Avatar : chevauche la bannière (le pseudo reste en dessous). */}
                <div className="-mt-12">
                    <div ref={avatarMenuRef} className="relative inline-block">
                        <UserAvatar
                            pseudo={user.pseudo}
                            avatarUrl={user.avatarUrl}
                            className="size-24 ring-4 ring-card"
                            textClassName="text-2xl"
                        />
                        {busy === "avatar" && (
                            <span className="absolute inset-0 grid place-items-center rounded-full bg-black/50">
                                <span className="size-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            </span>
                        )}
                        <button
                            type="button"
                            onClick={() => setAvatarMenu((v) => !v)}
                            aria-label="Modifier l'avatar"
                            aria-expanded={avatarMenu}
                            className="absolute -bottom-1 -right-1 grid size-8 place-items-center rounded-full border border-border bg-popover text-foreground shadow-lg transition-colors hover:bg-secondary"
                        >
                            <Icon icon={Camera01Icon} size={15} />
                        </button>

                        {avatarMenu && (
                            <div className="absolute left-0 top-full z-20 mt-2 w-48 overflow-hidden rounded-xl border border-border bg-popover p-1.5 shadow-2xl shadow-black/50">
                                <AvatarMenuItem
                                    icon={Upload01Icon}
                                    onClick={() => {
                                        setAvatarMenu(false);
                                        avatarInputRef.current?.click();
                                    }}
                                >
                                    Importer une image
                                </AvatarMenuItem>
                                {user.avatarUrl && (
                                    <AvatarMenuItem
                                        icon={Delete02Icon}
                                        onClick={() => {
                                            setAvatarMenu(false);
                                            void run("avatar", deleteAvatar);
                                        }}
                                    >
                                        Retirer l'avatar
                                    </AvatarMenuItem>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="mt-3 min-w-0">
                        <h1 className="truncate font-heading text-2xl font-bold tracking-tight">
                            {user.pseudo}
                        </h1>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            {user.provider === "GOOGLE" && (
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5 font-medium">
                                    <Icon icon={GoogleIcon} size={12} />
                                    Compte Google
                                </span>
                            )}
                            <span className="inline-flex items-center gap-1.5">
                                <Icon icon={Calendar03Icon} size={13} />
                                Membre depuis {memberSince}
                            </span>
                        </div>
                    </div>
                </div>

                <p
                    className={cn(
                        "mt-3 max-w-2xl text-sm leading-relaxed",
                        user.bio ? "text-foreground/90" : "italic text-muted-foreground",
                    )}
                >
                    {user.bio ?? "Aucune bio pour le moment — racontez-vous dans l'onglet Profil."}
                </p>

                {error && (
                    <p role="alert" className="mt-3 text-sm text-destructive">
                        {error}
                    </p>
                )}

                <div className="mt-5 border-t border-border pt-5">
                    <StatsStrip />
                </div>
            </div>
        </section>
    );
}

/* ------------------------------ sous-vues ------------------------------ */

function BannerButton({
    icon,
    label,
    onClick,
    disabled,
    children,
}: {
    icon: (typeof Camera01Icon);
    label?: string;
    onClick: () => void;
    disabled?: boolean;
    children?: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            title={label}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/55 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur transition-colors hover:bg-black/75 disabled:pointer-events-none disabled:opacity-60"
        >
            <Icon icon={icon} size={14} />
            {children}
        </button>
    );
}

function AvatarMenuItem({
    icon,
    onClick,
    children,
}: {
    icon: (typeof Camera01Icon);
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
            <Icon icon={icon} size={16} />
            {children}
        </button>
    );
}
