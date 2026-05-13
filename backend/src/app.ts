import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env';
import { swaggerSpec } from './config/swagger';

import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/user/user.routes';
import walletRoutes from './modules/wallet/wallet.routes';
import transactionRoutes from './modules/transaction/transaction.routes';

import { errorHandler, notFoundHandler } from './middleware/error.middleware';

/**
 * Derive the public base URL of the API from the incoming request, honouring
 * the X-Forwarded-* headers that proxies (Render, Heroku, etc.) inject.
 * Falls back to the request's own protocol/host for direct local access.
 */
function publicBaseUrl(req: Request): string {
    const forwardedProto = String(req.headers['x-forwarded-proto'] ?? '')
        .split(',')[0]
        .trim();
    const proto = forwardedProto || req.protocol || 'http';
    const host = String(
        req.headers['x-forwarded-host'] ?? req.headers.host ?? ''
    ).trim();
    return host ? `${proto}://${host}` : '';
}

export function createApp() {
    const app = express();

    // Required so req.protocol respects X-Forwarded-Proto on Render et al.
    app.set('trust proxy', true);

    app.use(helmet());
    app.use(
        cors({
            origin: env.CORS_ORIGIN.split(',').map((s) => s.trim()),
            credentials: true,
        })
    );
    app.use(express.json({ limit: '1mb' }));
    app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

    // Health
    app.get('/health', (_req: Request, res: Response) => {
        res.json({ success: true, message: 'OK', data: { status: 'healthy' } });
    });

    // API docs
    //
    // /api/docs.json is rebuilt per request so the `servers` block always
    // points at the actual host serving the docs (localhost in dev, the
    // Render URL in production, a custom domain, etc.).
    app.get('/api/docs.json', (req, res) => {
        const url = publicBaseUrl(req);
        res.json({
            ...(swaggerSpec as object),
            servers: url ? [{ url, description: 'Current host' }] : [],
        });
    });
    app.use(
        '/api/docs',
        swaggerUi.serve,
        swaggerUi.setup(undefined, {
            explorer: true,
            // Point Swagger UI at the dynamic JSON above so it picks up
            // whatever server URL is correct for this host.
            swaggerOptions: { url: '/api/docs.json' },
        })
    );

    // API routes
    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/wallet', walletRoutes);
    app.use('/api/transactions', transactionRoutes);

    // 404 + error
    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
}
