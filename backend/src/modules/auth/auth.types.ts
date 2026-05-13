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
