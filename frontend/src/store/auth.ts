import { PublicUser } from '../types';

const TOKEN_KEY = 'wallet.token';
const USER_KEY = 'wallet.user';

export const authStore = {
    getToken(): string | null {
        return localStorage.getItem(TOKEN_KEY);
    },
    setToken(token: string) {
        localStorage.setItem(TOKEN_KEY, token);
    },
    getUser(): PublicUser | null {
        const raw = localStorage.getItem(USER_KEY);
        if (!raw) return null;
        try {
            return JSON.parse(raw) as PublicUser;
        } catch {
            return null;
        }
    },
    setUser(user: PublicUser) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    },
    setSession(token: string, user: PublicUser) {
        this.setToken(token);
        this.setUser(user);
    },
    clear() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    },
    isAuthenticated(): boolean {
        return Boolean(this.getToken());
    },
};
