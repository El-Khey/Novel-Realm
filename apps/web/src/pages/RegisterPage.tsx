import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import * as api from "../service/auth.service";
import AuthLayout from "../components/ui/AuthLayout";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import FormError from "../components/ui/FormError";

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
        <AuthLayout title="Créer un compte">
            <Input placeholder="Pseudo" value={pseudo} onChange={setPseudo} />
            <Input type="email" placeholder="Email" value={email} onChange={setEmail} />
            <Input type="password" placeholder="Mot de passe" value={password} onChange={setPassword} />
            <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Création…" : "Créer mon compte"}
            </Button>
            <FormError message={error} />
            <p>Déjà un compte ? <Link to="/login">Se connecter</Link></p>
        </AuthLayout>
    );
}