import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import ProfilPage from "@/pages/ProfilPage";

function App() {
    return (
        <Routes>
            {/* Routes publiques — rendues immédiatement, sans attendre la session. */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Routes protégées — ProtectedRoute gère le chargement de la session. */}
            <Route element={<ProtectedRoute />}>
                <Route path="/profil" element={<ProfilPage />} />
            </Route>

            <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}

export default App;
