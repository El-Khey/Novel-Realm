import { Link } from "react-router-dom";
import { BookOpen01Icon, DiscordIcon, GithubIcon, NewTwitterIcon } from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { useGenres } from "@/features/genres/hooks/useGenres";
import { Icon } from "@/components/ui/icon";

interface FooterLink {
    label: string;
    to: string;
}

const EXPLORE_LINKS: FooterLink[] = [
    { label: "Tous les novels", to: "/explorer" },
    { label: "Populaires", to: "/explorer?sort=popularity" },
    { label: "Nouveautés", to: "/explorer" },
];

const SPACE_LINKS: FooterLink[] = [
    { label: "Accueil", to: "/" },
    { label: "Ma bibliothèque", to: "/novels" },
    { label: "Historique", to: "/historique" },
    { label: "Mon compte", to: "/profil" },
];

const SOCIALS: { label: string; href: string; icon: IconSvgElement }[] = [
    { label: "Discord", href: "#", icon: DiscordIcon },
    { label: "X (Twitter)", href: "#", icon: NewTwitterIcon },
    { label: "GitHub", href: "#", icon: GithubIcon },
];

/**
 * Pied de page global : marque + réseaux, colonnes de liens (vers de vraies
 * routes) et bandeau bas. Rendu par {@code AppLayout}, donc présent en bas de
 * toutes les pages connectées.
 */
export default function Footer() {
    const { genres } = useGenres();
    const topGenres = (genres ?? []).slice(0, 6);
    const year = new Date().getFullYear();

    return (
        <footer className="relative border-t border-border/60">
            {/* Filet cramoisi décoratif + lueur discrète */}
            <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent" />
            <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute -top-24 left-1/2 size-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
            </div>

            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-14">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:gap-12">
                    {/* Marque */}
                    <div className="col-span-2 md:col-span-1">
                        <Link to="/" aria-label="Accueil" className="inline-flex items-center gap-2">
                            <span className="grid size-9 place-items-center rounded-xl bg-linear-to-br from-primary to-primary-active text-primary-foreground shadow-lg shadow-primary/30">
                                <Icon icon={BookOpen01Icon} size={19} strokeWidth={2.4} />
                            </span>
                            <span className="font-heading text-lg font-extrabold tracking-tight">
                                Novel<span className="text-primary">Realm</span>
                            </span>
                        </Link>
                        <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
                            Votre destination pour les light novels et web-novels, à lire en français.
                        </p>
                        <div className="mt-5 flex gap-2">
                            {SOCIALS.map((s) => (
                                <a
                                    key={s.label}
                                    href={s.href}
                                    aria-label={s.label}
                                    className="grid size-9 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:bg-secondary hover:text-foreground"
                                >
                                    <Icon icon={s.icon} size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Explorer */}
                    <FooterColumn title="Explorer" links={EXPLORE_LINKS} />

                    {/* Genres (dynamiques) */}
                    <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Genres
                        </h3>
                        <ul className="mt-4 space-y-2.5">
                            {(topGenres.length > 0
                                ? topGenres.map((g) => ({ label: g.name, to: `/explorer?genreId=${g.id}` }))
                                : [{ label: "Tous les genres", to: "/explorer" }]
                            ).map((l) => (
                                <li key={l.to}>
                                    <FooterAnchor to={l.to}>{l.label}</FooterAnchor>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Mon espace */}
                    <FooterColumn title="Mon espace" links={SPACE_LINKS} />
                </div>

                {/* Bandeau bas */}
                <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-6 sm:flex-row">
                    <p className="text-xs text-muted-foreground">
                        © {year} Novel Realm — projet d'apprentissage.
                    </p>
                    <a
                        href="#"
                        className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
                    >
                        <Icon icon={DiscordIcon} size={18} className="text-primary" />
                        Rejoins-nous sur Discord
                    </a>
                </div>
            </div>
        </footer>
    );
}

function FooterColumn({ title, links }: { title: string; links: FooterLink[] }) {
    return (
        <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {title}
            </h3>
            <ul className="mt-4 space-y-2.5">
                {links.map((l) => (
                    <li key={l.label}>
                        <FooterAnchor to={l.to}>{l.label}</FooterAnchor>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function FooterAnchor({ to, children }: { to: string; children: React.ReactNode }) {
    return (
        <Link
            to={to}
            className="text-sm text-muted-foreground transition-colors hover:text-primary"
        >
            {children}
        </Link>
    );
}
