import { Navigate, Outlet } from 'react-router-dom';
import { authStore } from '../store/auth';

export default function PublicOnlyRoute() {
    if (authStore.isAuthenticated()) {
        return <Navigate to="/dashboard" replace />;
    }
    return <Outlet />;
}
