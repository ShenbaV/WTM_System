import { api } from './api';
import { ApiResponse, AuthResponse } from '../types';

export const authService = {
    async register(payload: { name: string; email: string; password: string }) {
        const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/register', payload);
        if (!data.data) throw new Error(data.message);
        return data.data;
    },

    async login(payload: { email: string; password: string }) {
        const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/login', payload);
        if (!data.data) throw new Error(data.message);
        return data.data;
    },
};
