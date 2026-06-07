import { useAuth } from "../features/auth/hooks/useAuth";

export default function ProfilPage() {
    const { user, logout } = useAuth();

    if (!user) return null;

    return (
        <div>
            <h2>Bienvenue, {user.pseudo}</h2>
            <p>Email : {user.email}</p>
            <p>Membre depuis : {new Date(user.createdAt).toLocaleDateString("fr-FR")}</p>
            <button onClick={() => logout()}>Se déconnecter</button>
        </div>
    );
}