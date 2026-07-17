import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";

type AppLayoutProps = {
    children: React.ReactNode;
};

/**
 * Coquille des pages connectées : barre de navigation + contenu + pied de page.
 * Thème sombre, comme le reste de la marque. La colonne flex (`main` en
 * `flex-1`) colle le footer en bas même quand le contenu est court. Chaque page
 * gère sa propre largeur dans `children`.
 */
export default function AppLayout({ children }: AppLayoutProps) {
    return (
        <div className="dark flex min-h-screen flex-col bg-background text-foreground">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    );
}
