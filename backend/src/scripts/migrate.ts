import 'reflect-metadata';
import { AppDataSource } from '../config/data-source';

/**
 * Runs TypeORM migrations against the configured DATABASE_URL.
 * Pass `--revert` to roll back the most recently applied migration.
 *
 * Examples:
 *   npm run migrate
 *   npm run migrate:revert
 */
async function main() {
    const revert = process.argv.includes('--revert');

    await AppDataSource.initialize();
    try {
        if (revert) {
            console.log('Reverting last migration...');
            await AppDataSource.undoLastMigration({ transaction: 'all' });
            console.log('Last migration reverted.');
            return;
        }

        const pending = await AppDataSource.showMigrations();
        if (!pending) {
            console.log('Database is already up to date — no pending migrations.');
            return;
        }

        const applied = await AppDataSource.runMigrations({ transaction: 'all' });
        if (applied.length === 0) {
            console.log('No migrations were applied.');
        } else {
            console.log(`Applied ${applied.length} migration(s):`);
            for (const m of applied) console.log(' -', m.name);
        }
    } finally {
        await AppDataSource.destroy();
    }
}

main()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error('Migration failed:', err);
        process.exit(1);
    });
