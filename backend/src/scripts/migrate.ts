import fs from 'fs';
import path from 'path';
import { pool } from '../config/db';

/**
 * Runs the schema.sql file against the configured DATABASE_URL.
 * The schema uses IF NOT EXISTS guards, so it is safe to re-run.
 */
async function migrate() {
    const schemaPath = path.resolve(__dirname, '..', '..', 'db', 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
        throw new Error(`Schema file not found at ${schemaPath}`);
    }
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log(`Applying schema from ${schemaPath}`);
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('COMMIT');
        console.log('Migration applied successfully.');
    } catch (err) {
        await client.query('ROLLBACK').catch(() => undefined);
        throw err;
    } finally {
        client.release();
    }
}

migrate()
    .then(() => pool.end())
    .then(() => process.exit(0))
    .catch((err) => {
        console.error('Migration failed:', err);
        pool.end().finally(() => process.exit(1));
    });
