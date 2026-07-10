import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import FullPageLoader from "@/components/ui/FullPageLoader";

export default function ProtectedRoute() {
    const { user, loading } = useAuth();

    if (loading) return <FullPageLoader />;
    if (!user) return <Navigate to="/login" replace />;

    return <Outlet />;
}
