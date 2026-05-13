import 'reflect-metadata';
import { createApp } from './app';
import { env } from './config/env';
import { AppDataSource } from './config/data-source';

async function bootstrap() {
    try {
        await AppDataSource.initialize();
        console.log('PostgreSQL connection initialized (TypeORM DataSource)');
    } catch (err) {
        console.error('Failed to initialize DataSource:', err);
        process.exit(1);
    }

    const app = createApp();
    const server = app.listen(env.PORT, () => {
        console.log(`API running on http://localhost:${env.PORT}`);
        console.log(`Swagger UI at  http://localhost:${env.PORT}/api/docs`);
    });

    const shutdown = (signal: string) => {
        console.log(`\nReceived ${signal}, shutting down gracefully...`);
        server.close(async () => {
            try {
                if (AppDataSource.isInitialized) await AppDataSource.destroy();
            } catch (err) {
                console.error('Error during DataSource shutdown:', err);
            }
            process.exit(0);
        });
    };
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
}

bootstrap().catch((err) => {
    console.error('Fatal error during bootstrap:', err);
    process.exit(1);
});
