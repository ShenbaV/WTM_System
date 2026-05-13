import { createApp } from './app';
import { env } from './config/env';
import { pool } from './config/db';

async function bootstrap() {
    const app = createApp();

    // Lightweight DB liveness check; we keep the server up either way so the
    // process is observable, but log a loud warning if the DB is unreachable.
    try {
        await pool.query('SELECT 1');
        console.log('PostgreSQL connection OK');
    } catch (err) {
        console.error('PostgreSQL connection FAILED at startup:', err);
    }

    const server = app.listen(env.PORT, () => {
        console.log(`API running on http://localhost:${env.PORT}`);
        console.log(`Swagger UI at  http://localhost:${env.PORT}/api/docs`);
    });

    const shutdown = (signal: string) => {
        console.log(`\nReceived ${signal}, shutting down gracefully...`);
        server.close(() => {
            pool.end().finally(() => process.exit(0));
        });
    };
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
}

bootstrap().catch((err) => {
    console.error('Fatal error during bootstrap:', err);
    process.exit(1);
});
