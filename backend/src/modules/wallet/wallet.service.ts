import { pool, withTransaction } from '../../config/db';
import { ApiError } from '../../utils/ApiError';
import { fromMinorUnits, toMinorUnits } from '../../utils/money';
import { AddMoneyInput, TransferInput } from './wallet.validation';
import { TransferResultDto, WalletDto, WalletRow } from './wallet.types';

function toWalletDto(row: WalletRow): WalletDto {
    return {
        id: row.id,
        userId: row.user_id,
        balance: fromMinorUnits(row.balance),
        balanceMinor: row.balance,
        createdAt: row.created_at,
    };
}

export const walletService = {
    async getWalletByUser(userId: string): Promise<WalletDto> {
        const { rows } = await pool.query<WalletRow>(
            `SELECT id, user_id, balance, created_at
             FROM wallets WHERE user_id = $1`,
            [userId]
        );
        const wallet = rows[0];
        if (!wallet) {
            throw ApiError.notFound('Wallet not found');
        }
        return toWalletDto(wallet);
    },

    /**
     * Add money (DEPOSIT) is a single-wallet update, but we still run it inside
     * a transaction with FOR UPDATE row locking so concurrent deposits/transfers
     * can't race against each other.
     */
    async addMoney(userId: string, input: AddMoneyInput): Promise<WalletDto> {
        const amountMinor = toMinorUnits(input.amount);

        const wallet = await withTransaction(async (client) => {
            const locked = await client.query<WalletRow>(
                `SELECT id, user_id, balance, created_at
                 FROM wallets WHERE user_id = $1 FOR UPDATE`,
                [userId]
            );
            const current = locked.rows[0];
            if (!current) {
                throw ApiError.notFound('Wallet not found');
            }

            const updated = await client.query<WalletRow>(
                `UPDATE wallets
                 SET balance = balance + $1
                 WHERE id = $2
                 RETURNING id, user_id, balance, created_at`,
                [amountMinor.toString(), current.id]
            );

            await client.query(
                `INSERT INTO transactions
                    (sender_wallet_id, receiver_wallet_id, type, amount, status, description)
                 VALUES (NULL, $1, 'DEPOSIT', $2, 'SUCCESS', $3)`,
                [current.id, amountMinor.toString(), 'Wallet top-up']
            );

            return updated.rows[0];
        });

        return toWalletDto(wallet);
    },

    /**
     * Money transfer between two users.
     *
     * Critical rules:
     *   - Single PG transaction (BEGIN / COMMIT / ROLLBACK).
     *   - Both wallets locked with SELECT ... FOR UPDATE.
     *   - Lock order is deterministic (by wallet.id ASC) to prevent deadlocks
     *     when two users transfer to each other simultaneously.
     *   - All validation runs AFTER the locks are held to avoid TOCTOU bugs.
     *   - On any failure, we ROLLBACK; the caller never sees a partial debit/credit.
     */
    async transfer(
        senderUserId: string,
        senderEmail: string,
        input: TransferInput
    ): Promise<TransferResultDto> {
        if (senderEmail.toLowerCase() === input.receiverEmail.toLowerCase()) {
            throw ApiError.badRequest('You cannot transfer money to yourself');
        }

        const amountMinor = toMinorUnits(input.amount);

        return withTransaction(async (client) => {
            // 1. Resolve receiver (and their wallet) by email.
            const receiverResult = await client.query<{
                user_id: string;
                wallet_id: string;
                name: string;
                email: string;
            }>(
                `SELECT u.id AS user_id, w.id AS wallet_id, u.name, u.email
                 FROM users u
                 JOIN wallets w ON w.user_id = u.id
                 WHERE u.email = $1`,
                [input.receiverEmail]
            );
            const receiver = receiverResult.rows[0];
            if (!receiver) {
                throw ApiError.notFound('Receiver not found');
            }

            // Defence-in-depth: also block self-transfer by user id.
            if (receiver.user_id === senderUserId) {
                throw ApiError.badRequest('You cannot transfer money to yourself');
            }

            // 2. Resolve sender wallet id (no lock yet — we lock both in order below).
            const senderWalletResult = await client.query<{ id: string }>(
                'SELECT id FROM wallets WHERE user_id = $1',
                [senderUserId]
            );
            const senderWalletId = senderWalletResult.rows[0]?.id;
            if (!senderWalletId) {
                throw ApiError.notFound('Sender wallet not found');
            }

            // 3. Lock both wallets in a deterministic order to avoid deadlocks.
            const [firstId, secondId] = [senderWalletId, receiver.wallet_id].sort();
            const lockResult = await client.query<WalletRow>(
                `SELECT id, user_id, balance, created_at
                 FROM wallets
                 WHERE id = ANY($1::uuid[])
                 ORDER BY id
                 FOR UPDATE`,
                [[firstId, secondId]]
            );
            if (lockResult.rowCount !== 2) {
                throw ApiError.internal('Failed to lock wallets for transfer');
            }
            const senderWallet = lockResult.rows.find((r) => r.id === senderWalletId)!;

            // 4. Validate balance under lock.
            const senderBalance = BigInt(senderWallet.balance);
            if (senderBalance < amountMinor) {
                throw ApiError.badRequest('Insufficient balance');
            }

            // 5. Debit sender.
            const debit = await client.query<WalletRow>(
                `UPDATE wallets
                 SET balance = balance - $1
                 WHERE id = $2
                 RETURNING id, user_id, balance, created_at`,
                [amountMinor.toString(), senderWalletId]
            );

            // 6. Credit receiver.
            await client.query(
                `UPDATE wallets
                 SET balance = balance + $1
                 WHERE id = $2`,
                [amountMinor.toString(), receiver.wallet_id]
            );

            // 7. Insert transaction record.
            const txResult = await client.query<{ id: string }>(
                `INSERT INTO transactions
                    (sender_wallet_id, receiver_wallet_id, type, amount, status, description)
                 VALUES ($1, $2, 'TRANSFER', $3, 'SUCCESS', $4)
                 RETURNING id`,
                [
                    senderWalletId,
                    receiver.wallet_id,
                    amountMinor.toString(),
                    input.description ?? null,
                ]
            );

            const updatedSender = debit.rows[0];
            return {
                transactionId: txResult.rows[0].id,
                senderBalance: fromMinorUnits(updatedSender.balance),
                senderBalanceMinor: updatedSender.balance,
                amount: input.amount,
                receiverName: receiver.name,
                receiverEmail: receiver.email,
            };
        });
    },
};
