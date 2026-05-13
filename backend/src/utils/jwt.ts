import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthUser } from '../types';

export function signToken(payload: AuthUser): string {
    const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] };
    return jwt.sign(payload, env.JWT_SECRET, options);
}

export function verifyToken(token: string): AuthUser {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthUser & { iat?: number; exp?: number };
    return { id: decoded.id, email: decoded.email };
}
