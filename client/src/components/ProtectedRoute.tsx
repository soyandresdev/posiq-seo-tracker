import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import Loading from "./Loading";

export default function ProtectedRoute() {
    const { token, loading } = useApp();
    const { pathname, search } = useLocation();

    if (loading) return <Loading />;
    if (!token) return <Navigate to={`/login?redirect=${encodeURIComponent(pathname + search)}`} replace />;
    return <Outlet />;
}
