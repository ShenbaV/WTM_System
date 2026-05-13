import { Pool, PoolClient } from 'pg';
import { env } from './env';

export const pool = new Pool({
    connectionString: env.DATABASE_URL,
    ssl: env.DB_SSL ? { rejectUnauthorized: false } : undefined,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle PG client', err);
});

export async function withTransaction<T>(
    handler: (client: PoolClient) => Promise<T>
): Promise<T> {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await handler(client);
        await client.query('COMMIT');
        return result;
    } catch (err) {
        try {
            await client.query('ROLLBACK');
        } catch (rollbackErr) {
            console.error('Failed to rollback transaction', rollbackErr);
        }
        throw err;
    } finally {
        client.release();
    }
}
