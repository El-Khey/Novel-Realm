type AuthLayoutProps = {
    children: React.ReactNode;
};

/**
 * Shell d'authentification — look "marketing sombre" du design Binance :
 * canvas quasi-noir, accent jaune, panneau de marque à gauche + formulaire
 * à droite. Force le thème sombre via la classe `dark`.
 */
export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="dark min-h-screen w-full bg-background text-foreground lg:grid lg:grid-cols-2">
            {/* Panneau de marque (caché en mobile) */}
            <aside className="relative hidden flex-col justify-between border-r border-border bg-background p-12 lg:flex">
                <div className="flex items-center gap-2.5">
                    <span className="grid size-9 place-items-center rounded-md bg-primary text-lg font-bold text-primary-foreground">
                        N
                    </span>
                    <span className="text-lg font-semibold tracking-tight">NovelRealm</span>
                </div>

                <div className="space-y-5">
                    <h1 className="text-5xl font-bold leading-[1.05] tracking-tight">
                        Plonge dans des <span className="text-primary">mondes</span> infinis.
                    </h1>
                    <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                        Lis, écris et partage tes romans. Rejoins une communauté de
                        lecteurs et d'auteurs et fais vivre tes histoires.
                    </p>
                </div>

                <p className="text-xs text-muted-foreground">© 2026 NovelRealm. Tous droits réservés.</p>
            </aside>

            {/* Panneau formulaire */}
            <main className="flex min-h-screen items-center justify-center bg-background p-6">
                <div className="w-full max-w-sm">
                    {/* Marque visible en mobile (le panneau de gauche est masqué) */}
                    <div className="mb-8 flex items-center gap-2.5 lg:hidden">
                        <span className="grid size-9 place-items-center rounded-md bg-primary text-lg font-bold text-primary-foreground">
                            N
                        </span>
                        <span className="text-lg font-semibold tracking-tight">NovelRealm</span>
                    </div>
                    {children}
                </div>
            </main>
        </div>
    );
}
