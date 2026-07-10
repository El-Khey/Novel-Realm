import Navbar from "@/components/ui/Navbar";

type AppLayoutProps = {
    children: React.ReactNode;
};

/**
 * Coquille des pages connectées : barre de navigation + zone de contenu.
 * Thème sombre, comme le reste de la marque. Chaque page gère sa propre
 * largeur dans `children`.
 */
export default function AppLayout({ children }: AppLayoutProps) {
    return (
        <div className="dark min-h-screen bg-background text-foreground">
            <Navbar />
            <main>{children}</main>
        </div>
    );
}
