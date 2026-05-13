export interface UserRow {
    id: string;
    name: string;
    email: string;
    password_hash: string;
    created_at: string;
}

export interface PublicUser {
    id: string;
    name: string;
    email: string;
    createdAt: string;
}

export interface AuthResponse {
    token: string;
    user: PublicUser;
}
