import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import AuthLayout from './layouts/AuthLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import PublicOnlyRoute from './routes/PublicOnlyRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddMoney from './pages/AddMoney';
import Transfer from './pages/Transfer';
import TransactionHistory from './pages/TransactionHistory';

export default function App() {
    return (
        <Routes>
            <Route element={<PublicOnlyRoute />}>
                <Route element={<AuthLayout />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                </Route>
            </Route>

            <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/add-money" element={<AddMoney />} />
                    <Route path="/transfer" element={<Transfer />} />
                    <Route path="/transactions" element={<TransactionHistory />} />
                </Route>
            </Route>

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
}
