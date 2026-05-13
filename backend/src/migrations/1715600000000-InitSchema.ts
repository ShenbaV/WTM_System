import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1715600000000 implements MigrationInterface {
    name = 'InitSchema1715600000000';

    public async up(qr: QueryRunner): Promise<void> {
        await qr.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

        await qr.query(`
            CREATE TABLE IF NOT EXISTS "users" (
                "id"            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "name"          VARCHAR(120) NOT NULL,
                "email"         VARCHAR(180) NOT NULL UNIQUE,
                "password_hash" TEXT NOT NULL,
                "created_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        `);
        await qr.query(
            `CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users" ("email")`
        );

        await qr.query(`
            CREATE TABLE IF NOT EXISTS "wallets" (
                "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "user_id"    UUID NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
                "balance"    BIGINT NOT NULL DEFAULT 0,
                "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                CONSTRAINT "balance_non_negative" CHECK ("balance" >= 0)
            )
        `);
        await qr.query(
            `CREATE INDEX IF NOT EXISTS "idx_wallets_user_id" ON "wallets" ("user_id")`
        );

        await qr.query(`
            CREATE TABLE IF NOT EXISTS "transactions" (
                "id"                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "sender_wallet_id"   UUID REFERENCES "wallets"("id") ON DELETE SET NULL,
                "receiver_wallet_id" UUID REFERENCES "wallets"("id") ON DELETE SET NULL,
                "type"               VARCHAR(20) NOT NULL,
                "amount"             BIGINT NOT NULL,
                "status"             VARCHAR(20) NOT NULL,
                "description"        TEXT,
                "created_at"         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                CONSTRAINT "tx_type"             CHECK ("type" IN ('DEPOSIT','TRANSFER')),
                CONSTRAINT "tx_status"           CHECK ("status" IN ('SUCCESS','FAILED','PENDING')),
                CONSTRAINT "tx_amount_positive"  CHECK ("amount" > 0)
            )
        `);
        await qr.query(
            `CREATE INDEX IF NOT EXISTS "idx_tx_sender"   ON "transactions" ("sender_wallet_id")`
        );
        await qr.query(
            `CREATE INDEX IF NOT EXISTS "idx_tx_receiver" ON "transactions" ("receiver_wallet_id")`
        );
        await qr.query(
            `CREATE INDEX IF NOT EXISTS "idx_tx_created"  ON "transactions" ("created_at" DESC)`
        );
    }

    public async down(qr: QueryRunner): Promise<void> {
        await qr.query(`DROP TABLE IF EXISTS "transactions"`);
        await qr.query(`DROP TABLE IF EXISTS "wallets"`);
        await qr.query(`DROP TABLE IF EXISTS "users"`);
    }
}
