import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ProfileHeader } from "@/features/profile/components/ProfileHeader";
import { ProfileInfoForm } from "@/features/profile/components/ProfileInfoForm";
import { AppearanceSettings } from "@/features/profile/components/AppearanceSettings";
import { AccountSettings } from "@/features/profile/components/AccountSettings";
import AppLayout from "@/components/ui/AppLayout";
import { cn } from "@/lib/utils";

const TABS = [
    { id: "profil", label: "Profil" },
    { id: "apparence", label: "Apparence" },
    { id: "compte", label: "Compte" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function isTabId(value: string | null): value is TabId {
    return TABS.some((t) => t.id === value);
}

/**
 * Page profil (issue #17) : identité (bannière, avatar, bio), statistiques
 * résumées, puis onglets Profil / Apparence / Compte. L'onglet actif vit dans
 * l'URL (`?tab=`) — lien partageable, bouton retour naturel.
 */
export default function ProfilPage() {
    const { user, updateUser } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();

    if (!user) return null; // ProtectedRoute garantit la session

    const rawTab = searchParams.get("tab");
    const tab: TabId = isTabId(rawTab) ? rawTab : "profil";

    function selectTab(id: TabId) {
        setSearchParams(id === "profil" ? {} : { tab: id }, { replace: true });
    }

    return (
        <AppLayout>
            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
                <h1 className="sr-only">Mon profil</h1>

                <ProfileHeader user={user} onUpdated={updateUser} />

                {/* Onglets */}
                <div
                    role="tablist"
                    aria-label="Sections du profil"
                    className="mt-6 flex gap-1 border-b border-border"
                >
                    {TABS.map((t) => (
                        <button
                            key={t.id}
                            type="button"
                            role="tab"
                            id={`tab-${t.id}`}
                            aria-selected={tab === t.id}
                            aria-controls={`panel-${t.id}`}
                            onClick={() => selectTab(t.id)}
                            className={cn(
                                "-mb-px rounded-t-lg border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors",
                                tab === t.id
                                    ? "border-primary text-foreground"
                                    : "border-transparent text-muted-foreground hover:text-foreground",
                            )}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                <div
                    role="tabpanel"
                    id={`panel-${tab}`}
                    aria-labelledby={`tab-${tab}`}
                    className="mt-5"
                >
                    {tab === "profil" && <ProfileInfoForm user={user} onUpdated={updateUser} />}
                    {tab === "apparence" && <AppearanceSettings />}
                    {tab === "compte" && <AccountSettings user={user} />}
                </div>
            </div>
        </AppLayout>
    );
}
