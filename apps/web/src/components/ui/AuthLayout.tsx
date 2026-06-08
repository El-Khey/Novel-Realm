import { LogoIcon } from "@/components/ui/Logo";

type AuthLayoutProps = {
    children: React.ReactNode;
};

/**
 * Shell d'authentification — layout centré et focalisé, thème sombre du design.
 * En-tête de marque (logo + nom + accroche) au-dessus de la carte de formulaire,
 * le tout centré sur le canvas quasi-noir. Pied de page discret pour ancrer le bas.
 */
export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="dark flex min-h-screen flex-col bg-background text-foreground">
            <main className="flex flex-1 items-center justify-center px-6 py-12">
                <div className="w-full max-w-sm space-y-8">
                    {/* En-tête de marque */}
                    <header className="flex flex-col items-center gap-4 text-center">
                        <LogoIcon className="h-12 w-12" />
                        <div className="space-y-1.5">
                            <h1 className="text-3xl font-bold tracking-tight">
                                Novel<span className="text-primary">Realm</span>
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Découvrez des centaines de nouvelles histoires.
                            </p>
                        </div>
                    </header>

                    {/* Carte de formulaire (Login / Register) */}
                    {children}
                </div>
            </main>

            <footer className="px-6 py-8 text-center text-xs text-muted-foreground">
                © 2026 NovelRealm. Tous droits réservés.
            </footer>
        </div>
    );
}
