import { AppDataSource } from '../../config/data-source';
import { Transaction } from '../../entities/Transaction.entity';
import { Wallet } from '../../entities/Wallet.entity';
import { ApiError } from '../../utils/ApiError';
import { fromMinorUnits } from '../../utils/money';
import { TransactionDto } from './transaction.types';
import { ListTransactionsInput } from './transaction.validation';

function toDto(t: Transaction, viewerWalletId: string): TransactionDto {
    const direction: 'CREDIT' | 'DEBIT' =
        t.receiverWalletId === viewerWalletId ? 'CREDIT' : 'DEBIT';
    const senderUser = t.senderWallet?.user ?? null;
    const receiverUser = t.receiverWallet?.user ?? null;

    return {
        id: t.id,
        type: t.type,
        status: t.status,
        amount: fromMinorUnits(t.amount),
        amountMinor: t.amount,
        description: t.description,
        createdAt: t.createdAt.toISOString(),
        direction,
        sender: senderUser ? { name: senderUser.name, email: senderUser.email } : null,
        receiver: receiverUser ? { name: receiverUser.name, email: receiverUser.email } : null,
    };
}

export const transactionService = {
    async listForUser(
        userId: string,
        opts: ListTransactionsInput
    ): Promise<{ transactions: TransactionDto[]; total: number }> {
        const walletRepo = AppDataSource.getRepository(Wallet);
        const wallet = await walletRepo.findOne({
            where: { userId },
            select: { id: true },
        });
        if (!wallet) {
            throw ApiError.notFound('Wallet not found');
        }

        const txRepo = AppDataSource.getRepository(Transaction);
        // Use entity property names (camelCase) — TypeORM translates them
        // to the underlying snake_case columns. Mixing raw column names with
        // skip()/take() + JOINs causes TypeORM's DISTINCT subquery to drop
        // the predicate and return zero rows.
        const [rows, total] = await txRepo
            .createQueryBuilder('t')
            .leftJoinAndSelect('t.senderWallet', 'sw')
            .leftJoinAndSelect('sw.user', 'su')
            .leftJoinAndSelect('t.receiverWallet', 'rw')
            .leftJoinAndSelect('rw.user', 'ru')
            .where('t.senderWalletId = :walletId', { walletId: wallet.id })
            .orWhere('t.receiverWalletId = :walletId', { walletId: wallet.id })
            .orderBy('t.createdAt', 'DESC')
            .skip(opts.offset)
            .take(opts.limit)
            .getManyAndCount();

        return {
            transactions: rows.map((row: Transaction) => toDto(row, wallet.id)),
            total,
        };
    },
};
