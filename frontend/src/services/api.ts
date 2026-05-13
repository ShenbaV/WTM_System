import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { authStore } from '../store/auth';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

export const api: AxiosInstance = axios.create({
    baseURL,
    timeout: 15000,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = authStore.getToken();
    if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 401 handling: clear stored session and bounce to /login (the route guard
// re-renders on the next render cycle once the token is gone).
api.interceptors.response.use(
    (res) => res,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            const onLoginPage =
                window.location.pathname === '/login' ||
                window.location.pathname === '/register';
            if (!onLoginPage) {
                authStore.clear();
                window.location.assign('/login');
            }
        }
        return Promise.reject(error);
    }
);

export function extractErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
    if (axios.isAxiosError(err)) {
        const data = err.response?.data as { message?: string } | undefined;
        return data?.message ?? err.message ?? fallback;
    }
    if (err instanceof Error) return err.message;
    return fallback;
}
