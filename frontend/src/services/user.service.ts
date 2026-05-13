import { api } from './api';
import { ApiResponse } from '../types';

export interface UserLookup {
    id: string;
    name: string;
    email: string;
    isSelf: boolean;
}

export const userService = {
    async lookup(email: string): Promise<UserLookup> {
        const { data } = await api.get<ApiResponse<UserLookup>>('/users/lookup', {
            params: { email },
        });
        if (!data.data) throw new Error(data.message);
        return data.data;
    },
};
