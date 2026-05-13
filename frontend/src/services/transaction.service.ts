import { api } from './api';
import { ApiResponse, TransactionListResult } from '../types';

export const transactionService = {
    async list(opts?: { limit?: number; offset?: number }) {
        const { data } = await api.get<ApiResponse<TransactionListResult>>('/transactions', {
            params: opts,
        });
        if (!data.data) throw new Error(data.message);
        return data.data;
    },
};
