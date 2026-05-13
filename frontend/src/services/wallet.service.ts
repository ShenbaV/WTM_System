import { api } from './api';
import { ApiResponse, TransferResult, Wallet } from '../types';

export const walletService = {
    async getWallet() {
        const { data } = await api.get<ApiResponse<Wallet>>('/wallet');
        if (!data.data) throw new Error(data.message);
        return data.data;
    },

    async addMoney(amount: number) {
        const { data } = await api.post<ApiResponse<Wallet>>('/wallet/add-money', { amount });
        if (!data.data) throw new Error(data.message);
        return data.data;
    },

    async transfer(payload: { receiverEmail: string; amount: number; description?: string }) {
        const { data } = await api.post<ApiResponse<TransferResult>>('/wallet/transfer', payload);
        if (!data.data) throw new Error(data.message);
        return data.data;
    },
};
