import { Request } from 'express';

export interface AuthUser {
    id: string;
    email: string;
}

export interface AuthRequest extends Request {
    user?: AuthUser;
}

export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
    error?: unknown;
}
