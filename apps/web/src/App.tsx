import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import HomePage from "@/pages/HomePage";
import LibraryPage from "@/pages/LibraryPage";
import NovelDetailPage from "@/pages/NovelDetailPage";
import ChapterReaderPage from "@/pages/ChapterReaderPage";
import ProfilPage from "@/pages/ProfilPage";

function App() {
    return (
        <Routes>
            {/* Routes publiques — rendues immédiatement, sans attendre la session. */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Routes protégées — ProtectedRoute gère le chargement de la session. */}
            <Route element={<ProtectedRoute />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/novels" element={<LibraryPage />} />
                <Route path="/novels/:id" element={<NovelDetailPage />} />
                <Route path="/novels/:novelId/chapters/:chapterId" element={<ChapterReaderPage />} />
                <Route path="/profil" element={<ProfilPage />} />
            </Route>

            {/* Toute route inconnue ramène à l'accueil. */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;
