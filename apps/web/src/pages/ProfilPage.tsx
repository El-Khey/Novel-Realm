import { useAuth } from "@/features/auth/hooks/useAuth";
import AppLayout from "@/components/ui/AppLayout";
import { Card, CardContent } from "@/components/ui/card";

export default function ProfilPage() {
    const { user } = useAuth();

    if (!user) return null;

    const initials = user.pseudo.trim().slice(0, 2).toUpperCase();
    const memberSince = new Date(user.createdAt).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    const details = [
        { label: "Pseudo", value: user.pseudo },
        { label: "Adresse e-mail", value: user.email },
        { label: "Membre depuis", value: memberSince },
    ];

    return (
        <AppLayout>
            <div className="mx-auto max-w-2xl px-6 py-10">
                <h1 className="mb-6 text-2xl font-bold tracking-tight">Mon compte</h1>

                <Card>
                    <CardContent className="space-y-6">
                        {/* Identité */}
                        <div className="flex items-center gap-4">
                            <div className="grid size-16 shrink-0 place-items-center rounded-full bg-primary text-xl font-semibold text-primary-foreground">
                                {initials}
                            </div>
                            <div className="min-w-0">
                                <p className="truncate text-lg font-semibold">{user.pseudo}</p>
                                <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                            </div>
                        </div>

                        {/* Détails du compte */}
                        <div className="border-t border-border pt-6">
                            <h2 className="mb-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Informations du compte
                            </h2>
                            <dl className="divide-y divide-border text-sm">
                                {details.map(({ label, value }) => (
                                    <div
                                        key={label}
                                        className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                                    >
                                        <dt className="text-muted-foreground">{label}</dt>
                                        <dd className="truncate font-medium">{value}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
