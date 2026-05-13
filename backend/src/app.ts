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

export function createApp() {
    const app = express();

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
    app.use(
        '/api/docs',
        swaggerUi.serve,
        swaggerUi.setup(swaggerSpec, { explorer: true })
    );
    app.get('/api/docs.json', (_req, res) => res.json(swaggerSpec));

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
