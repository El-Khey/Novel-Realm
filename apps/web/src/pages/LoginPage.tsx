import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../features/auth/hooks/useAuth";
import AuthLayout from "../components/ui/AuthLayout";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import FormError from "../components/ui/FormError";

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
        <AuthLayout title="Connexion">
            <Input type="email" placeholder="Email" value={email} onChange={setEmail} />
            <Input type="password" placeholder="Mot de passe" value={password} onChange={setPassword} />
            <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Connexion…" : "Se connecter"}
            </Button>
            <FormError message={error} />
            <p>Pas de compte ? <Link to="/register">Créer un compte</Link></p>
        </AuthLayout>
    );
}