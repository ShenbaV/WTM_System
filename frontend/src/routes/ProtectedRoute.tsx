import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { authStore } from '../store/auth';

export default function ProtectedRoute() {
    const location = useLocation();
    if (!authStore.isAuthenticated()) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }
    return <Outlet />;
}
