import { pool } from '../../config/db';
import { ApiError } from '../../utils/ApiError';
import { fromMinorUnits } from '../../utils/money';
import { TransactionDto, TransactionRow } from './transaction.types';
import { ListTransactionsInput } from './transaction.validation';

function toDto(row: TransactionRow, viewerWalletId: string): TransactionDto {
    const direction: 'CREDIT' | 'DEBIT' =
        row.receiver_wallet_id === viewerWalletId ? 'CREDIT' : 'DEBIT';

    return {
        id: row.id,
        type: row.type,
        status: row.status,
        amount: fromMinorUnits(row.amount),
        amountMinor: row.amount,
        description: row.description,
        createdAt: row.created_at,
        direction,
        sender: row.sender_name && row.sender_email
            ? { name: row.sender_name, email: row.sender_email }
            : null,
        receiver: row.receiver_name && row.receiver_email
            ? { name: row.receiver_name, email: row.receiver_email }
            : null,
    };
}

export const transactionService = {
    async listForUser(
        userId: string,
        opts: ListTransactionsInput
    ): Promise<{ transactions: TransactionDto[]; total: number }> {
        const walletRes = await pool.query<{ id: string }>(
            'SELECT id FROM wallets WHERE user_id = $1',
            [userId]
        );
        const walletId = walletRes.rows[0]?.id;
        if (!walletId) {
            throw ApiError.notFound('Wallet not found');
        }

        const totalRes = await pool.query<{ count: string }>(
            `SELECT COUNT(*)::text AS count
             FROM transactions
             WHERE sender_wallet_id = $1 OR receiver_wallet_id = $1`,
            [walletId]
        );
        const total = Number(totalRes.rows[0]?.count ?? '0');

        const rowsRes = await pool.query<TransactionRow>(
            `SELECT
                t.id,
                t.sender_wallet_id,
                t.receiver_wallet_id,
                t.type,
                t.amount,
                t.status,
                t.description,
                t.created_at,
                su.name  AS sender_name,
                su.email AS sender_email,
                ru.name  AS receiver_name,
                ru.email AS receiver_email
             FROM transactions t
             LEFT JOIN wallets sw ON sw.id = t.sender_wallet_id
             LEFT JOIN users   su ON su.id = sw.user_id
             LEFT JOIN wallets rw ON rw.id = t.receiver_wallet_id
             LEFT JOIN users   ru ON ru.id = rw.user_id
             WHERE t.sender_wallet_id = $1 OR t.receiver_wallet_id = $1
             ORDER BY t.created_at DESC
             LIMIT $2 OFFSET $3`,
            [walletId, opts.limit, opts.offset]
        );

        return {
            transactions: rowsRes.rows.map((r) => toDto(r, walletId)),
            total,
        };
    },
};
