import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function ProfilPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    if (!user) return null;

    async function handleLogout() {
        await logout();
        navigate("/login");
    }

    const memberSince = new Date(user.createdAt).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Bienvenue, {user.pseudo}</CardTitle>
                    <CardDescription>Ton compte NovelRealm</CardDescription>
                </CardHeader>

                <CardContent className="flex flex-col gap-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Email</span>
                        <span>{user.email}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Membre depuis</span>
                        <span>{memberSince}</span>
                    </div>
                </CardContent>

                <CardFooter>
                    <Button variant="outline" className="w-full" onClick={handleLogout}>
                        Se déconnecter
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
