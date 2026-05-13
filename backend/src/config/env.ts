import dotenv from 'dotenv';

dotenv.config();

function required(name: string, fallback?: string): string {
    const value = process.env[name] ?? fallback;
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

export const env = {
    PORT: Number(process.env.PORT ?? 4000),
    NODE_ENV: process.env.NODE_ENV ?? 'development',
    DATABASE_URL: required('DATABASE_URL'),
    DB_SSL: (process.env.DB_SSL ?? 'true').toLowerCase() === 'true',
    JWT_SECRET: required('JWT_SECRET'),
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '7d',
    CORS_ORIGIN: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
};
