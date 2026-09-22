import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function ProtectedRoute() {
    const { isAuthenticated, isLoading} = useAuth()
    const location = useLocation()

    if (isLoading)
        return <p>Chargement</p>

    if (!isAuthenticated)
        return <Navigate to="/login" state={{from: location}} replace/>

    return <Outlet/>
}
