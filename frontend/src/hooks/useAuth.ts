import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { authStore } from '../store/auth';
import { extractErrorMessage } from '../services/api';

export function useLogin() {
    const navigate = useNavigate();
    const qc = useQueryClient();
    const { enqueueSnackbar } = useSnackbar();

    return useMutation({
        mutationFn: authService.login,
        onSuccess: (data) => {
            authStore.setSession(data.token, data.user);
            qc.clear();
            enqueueSnackbar('Welcome back!', { variant: 'success' });
            navigate('/dashboard', { replace: true });
        },
        onError: (err) => {
            enqueueSnackbar(extractErrorMessage(err, 'Login failed'), { variant: 'error' });
        },
    });
}

export function useRegister() {
    const navigate = useNavigate();
    const qc = useQueryClient();
    const { enqueueSnackbar } = useSnackbar();

    return useMutation({
        mutationFn: authService.register,
        onSuccess: (data) => {
            authStore.setSession(data.token, data.user);
            qc.clear();
            enqueueSnackbar('Account created!', { variant: 'success' });
            navigate('/dashboard', { replace: true });
        },
        onError: (err) => {
            enqueueSnackbar(extractErrorMessage(err, 'Registration failed'), {
                variant: 'error',
            });
        },
    });
}

export function useLogout() {
    const navigate = useNavigate();
    const qc = useQueryClient();
    return () => {
        authStore.clear();
        qc.clear();
        navigate('/login', { replace: true });
    };
}
