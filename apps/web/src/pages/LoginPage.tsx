import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import FormError from "@/components/ui/FormError";
import AuthLayout from "@/components/ui/AuthLayout";
import AuthDivider from "@/components/ui/AuthDivider";
import GoogleButton from "@/features/auth/components/GoogleButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit() {
        setError(null);
        setSubmitting(true);
        try {
            await login(email, password);
            navigate("/profil");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur inconnue");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <AuthLayout>
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Connexion</CardTitle>
                    <CardDescription>Accède à ton compte NovelRealm.</CardDescription>
                </CardHeader>

                <CardContent className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="ton@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="password">Mot de passe</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <FormError message={error} />
                </CardContent>

                <CardFooter className="flex flex-col gap-4">
                    <Button className="w-full" onClick={handleSubmit} disabled={submitting}>
                        {submitting ? "Connexion…" : "Se connecter"}
                    </Button>

                    <AuthDivider />

                    <GoogleButton label="Se connecter avec Google" />

                    <p className="text-sm text-muted-foreground">
                        Pas de compte ?{" "}
                        <Link to="/register" className="text-primary underline-offset-4 hover:underline">
                            Créer un compte
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </AuthLayout>
    );
}