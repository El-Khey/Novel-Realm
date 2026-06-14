import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
    { label: "Accueil", to: "/", end: true },
    { label: "Bibliothèque", to: "/novels", end: false },
    { label: "Profil", to: "/profil", end: false },
];

/** Classe d'un lien de nav : sobre par défaut, pastille discrète quand actif. */
function navLinkClass({ isActive }: { isActive: boolean }) {
    return cn(
        "rounded-md px-3 py-2 text-sm font-medium transition-colors",
        isActive
            ? "bg-secondary text-foreground"
            : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
    );
}

function MenuIcon({ open }: { open: boolean }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-5"
            aria-hidden="true"
        >
            {open ? (
                <>
                    <path d="M6 6l12 12" />
                    <path d="M18 6L6 18" />
                </>
            ) : (
                <>
                    <path d="M4 7h16" />
                    <path d="M4 12h16" />
                    <path d="M4 17h16" />
                </>
            )}
        </svg>
    );
}

/** Barre de navigation des pages connectées (thème sombre). */
export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    async function handleLogout() {
        await logout();
        navigate("/login");
    }

    const initials = user ? user.pseudo.trim().slice(0, 2).toUpperCase() : "";

    return (
        <header className="sticky top-0 z-40 border-b border-border bg-background">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
                {/* Gauche : logo + navigation (desktop) */}
                <div className="flex items-center gap-6">
                    <Link to="/novels" aria-label="Accueil">
                        <Logo />
                    </Link>
                    <nav className="hidden items-center gap-1 md:flex">
                        {NAV_ITEMS.map((item) => (
                            <NavLink key={item.to} to={item.to} end={item.end} className={navLinkClass}>
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>
                </div>

                {/* Droite : identité + déconnexion (desktop) */}
                <div className="hidden items-center gap-3 md:flex">
                    <div className="flex items-center gap-2">
                        <span className="grid size-8 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                            {initials}
                        </span>
                        {user && <span className="text-sm font-medium">{user.pseudo}</span>}
                    </div>
                    <Button variant="outline" size="sm" onClick={handleLogout}>
                        Se déconnecter
                    </Button>
                </div>

                {/* Bouton menu (mobile) */}
                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    aria-label="Menu"
                    aria-expanded={open}
                    className="grid size-9 place-items-center rounded-md text-foreground transition-colors hover:bg-secondary md:hidden"
                >
                    <MenuIcon open={open} />
                </button>
            </div>

            {/* Menu déroulant (mobile) */}
            {open && (
                <div className="border-t border-border md:hidden">
                    <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
                        {NAV_ITEMS.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.end}
                                onClick={() => setOpen(false)}
                                className={navLinkClass}
                            >
                                {item.label}
                            </NavLink>
                        ))}
                        <Button variant="outline" size="sm" className="mt-2 w-full" onClick={handleLogout}>
                            Se déconnecter
                        </Button>
                    </nav>
                </div>
            )}
        </header>
    );
}
