import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { verifyToken } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';

export function authenticate(req: AuthRequest, _res: Response, next: NextFunction) {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        return next(ApiError.unauthorized('Missing or invalid Authorization header'));
    }
    const token = header.slice('Bearer '.length).trim();
    try {
        req.user = verifyToken(token);
        return next();
    } catch {
        return next(ApiError.unauthorized('Invalid or expired token'));
    }
}
