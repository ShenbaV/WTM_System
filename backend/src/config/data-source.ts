import 'reflect-metadata';
import path from 'path';
import { DataSource, QueryRunner } from 'typeorm';
import { env } from './env';
import { User } from '../entities/User.entity';
import { Wallet } from '../entities/Wallet.entity';
import { Transaction } from '../entities/Transaction.entity';

const isCompiled = __filename.endsWith('.js');
const migrationsGlob = path.join(
    __dirname,
    '..',
    'migrations',
    isCompiled ? '*.js' : '*.ts'
);

export const AppDataSource = new DataSource({
    type: 'postgres',
    url: env.DATABASE_URL,
    ssl: env.DB_SSL ? { rejectUnauthorized: false } : false,
    entities: [User, Wallet, Transaction],
    migrations: [migrationsGlob],
    migrationsTableName: 'typeorm_migrations',
    synchronize: false,
    logging: env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    extra: {
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
    },
});

/**
 * Run `handler` inside a single PostgreSQL transaction backed by a TypeORM
 * QueryRunner. On any thrown error we ROLLBACK and re-throw; on success we
 * COMMIT. The QueryRunner is always released back to the pool in `finally`.
 *
 * Use the QueryRunner's `manager` to obtain transaction-bound repositories.
 */
export async function withTransaction<T>(
    handler: (qr: QueryRunner) => Promise<T>
): Promise<T> {
    const qr = AppDataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
        const result = await handler(qr);
        await qr.commitTransaction();
        return result;
    } catch (err) {
        if (qr.isTransactionActive) {
            await qr.rollbackTransaction().catch((rollbackErr) => {
                console.error('Failed to rollback transaction', rollbackErr);
            });
        }
        throw err;
    } finally {
        await qr.release();
    }
}
