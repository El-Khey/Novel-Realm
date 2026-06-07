import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import * as api from "@/service/auth.service";
import FormError from "@/components/ui/FormError";
import AuthLayout from "@/components/ui/AuthLayout";
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

export default function RegisterPage() {
    const navigate = useNavigate();

    const [pseudo, setPseudo] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit() {
        setError(null);
        setSubmitting(true);
        try {
            await api.register(pseudo, email, password);
            navigate("/login");
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
                    <CardTitle>Créer un compte</CardTitle>
                    <CardDescription>Rejoins NovelRealm en quelques secondes.</CardDescription>
                </CardHeader>

                <CardContent className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="pseudo">Pseudo</Label>
                        <Input
                            id="pseudo"
                            value={pseudo}
                            onChange={(e) => setPseudo(e.target.value)}
                        />
                    </div>

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

                <CardFooter className="flex flex-col gap-3">
                    <Button className="w-full" onClick={handleSubmit} disabled={submitting}>
                        {submitting ? "Création…" : "Créer mon compte"}
                    </Button>
                    <p className="text-sm text-muted-foreground">
                        Déjà un compte ?{" "}
                        <Link to="/login" className="text-primary underline-offset-4 hover:underline">
                            Se connecter
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </AuthLayout>
    );
}