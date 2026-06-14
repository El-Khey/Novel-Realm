import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import LibraryPage from "@/pages/LibraryPage";
import NovelDetailPage from "@/pages/NovelDetailPage";
import ProfilPage from "@/pages/ProfilPage";

function App() {
    return (
        <Routes>
            {/* Routes publiques — rendues immédiatement, sans attendre la session. */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Routes protégées — ProtectedRoute gère le chargement de la session. */}
            <Route element={<ProtectedRoute />}>
                <Route path="/novels" element={<LibraryPage />} />
                <Route path="/novels/:id" element={<NovelDetailPage />} />
                <Route path="/profil" element={<ProfilPage />} />
            </Route>

            {/* La bibliothèque est l'accueil de l'app ; toute route inconnue y mène. */}
            <Route path="/" element={<Navigate to="/novels" replace />} />
            <Route path="*" element={<Navigate to="/novels" replace />} />
        </Routes>
    );
}

export default App;
