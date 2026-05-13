import { AppDataSource, withTransaction } from '../../config/data-source';
import { User } from '../../entities/User.entity';
import { Wallet } from '../../entities/Wallet.entity';
import { Transaction } from '../../entities/Transaction.entity';
import { ApiError } from '../../utils/ApiError';
import { fromMinorUnits, toMinorUnits } from '../../utils/money';
import { AddMoneyInput, TransferInput } from './wallet.validation';
import { TransferResultDto, WalletDto } from './wallet.types';

function toWalletDto(wallet: Wallet): WalletDto {
    return {
        id: wallet.id,
        userId: wallet.userId,
        balance: fromMinorUnits(wallet.balance),
        balanceMinor: wallet.balance,
        createdAt: wallet.createdAt.toISOString(),
    };
}

export const walletService = {
    async getWalletByUser(userId: string): Promise<WalletDto> {
        const walletRepo = AppDataSource.getRepository(Wallet);
        const wallet = await walletRepo.findOne({ where: { userId } });
        if (!wallet) {
            throw ApiError.notFound('Wallet not found');
        }
        return toWalletDto(wallet);
    },

    /**
     * Deposit money. Although a deposit only touches one wallet, we still lock
     * that row with FOR UPDATE so concurrent deposits/transfers can't race.
     */
    async addMoney(userId: string, input: AddMoneyInput): Promise<WalletDto> {
        const amountMinor = toMinorUnits(input.amount);

        const wallet = await withTransaction(async (qr) => {
            const walletRepo = qr.manager.getRepository(Wallet);
            const txRepo = qr.manager.getRepository(Transaction);

            const locked = await walletRepo
                .createQueryBuilder('w')
                .setLock('pessimistic_write')
                .where('w.user_id = :userId', { userId })
                .getOne();
            if (!locked) {
                throw ApiError.notFound('Wallet not found');
            }

            locked.balance = (BigInt(locked.balance) + amountMinor).toString();
            await walletRepo.save(locked);

            const tx = txRepo.create({
                senderWalletId: null,
                receiverWalletId: locked.id,
                type: 'DEPOSIT',
                amount: amountMinor.toString(),
                status: 'SUCCESS',
                description: 'Wallet top-up',
            });
            await txRepo.save(tx);

            return locked;
        });

        return toWalletDto(wallet);
    },

    /**
     * Money transfer between two users.
     *
     * Concurrency-safe by design:
     *   - Single PG transaction via QueryRunner (BEGIN / COMMIT / ROLLBACK).
     *   - Both wallet rows are locked with SELECT ... FOR UPDATE
     *     (TypeORM `setLock('pessimistic_write')`).
     *   - The two wallet IDs are sorted ASC and locked in a single query, so
     *     two users transferring to each other simultaneously can never
     *     deadlock (deterministic lock order).
     *   - Balance is validated *after* locks are held to avoid TOCTOU races.
     *   - Any thrown error rolls back the entire transaction.
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

        return withTransaction(async (qr) => {
            const userRepo = qr.manager.getRepository(User);
            const walletRepo = qr.manager.getRepository(Wallet);
            const txRepo = qr.manager.getRepository(Transaction);

            // 1. Resolve receiver (user + wallet) by email.
            const receiver = await userRepo.findOne({
                where: { email: input.receiverEmail },
                relations: { wallet: true },
            });
            if (!receiver || !receiver.wallet) {
                throw ApiError.notFound('Receiver not found');
            }
            if (receiver.id === senderUserId) {
                throw ApiError.badRequest('You cannot transfer money to yourself');
            }

            // 2. Resolve sender wallet id (no lock yet — we lock both below).
            const senderWalletRow = await walletRepo.findOne({
                where: { userId: senderUserId },
                select: { id: true },
            });
            if (!senderWalletRow) {
                throw ApiError.notFound('Sender wallet not found');
            }

            // 3. Lock both wallet rows in a deterministic order to avoid
            //    deadlocks between concurrent transfers in opposite directions.
            const orderedIds = [senderWalletRow.id, receiver.wallet.id].sort();
            const lockedWallets = await walletRepo
                .createQueryBuilder('w')
                .setLock('pessimistic_write')
                .where('w.id IN (:...ids)', { ids: orderedIds })
                .orderBy('w.id', 'ASC')
                .getMany();
            if (lockedWallets.length !== 2) {
                throw ApiError.internal('Failed to lock wallets for transfer');
            }
            const senderWallet = lockedWallets.find((w) => w.id === senderWalletRow.id)!;
            const receiverWallet = lockedWallets.find((w) => w.id === receiver.wallet!.id)!;

            // 4. Validate balance under lock.
            const senderBalance = BigInt(senderWallet.balance);
            if (senderBalance < amountMinor) {
                throw ApiError.badRequest('Insufficient balance');
            }

            // 5. Debit sender + credit receiver.
            senderWallet.balance = (senderBalance - amountMinor).toString();
            receiverWallet.balance = (
                BigInt(receiverWallet.balance) + amountMinor
            ).toString();
            await walletRepo.save([senderWallet, receiverWallet]);

            // 6. Record the transfer.
            const tx = txRepo.create({
                senderWalletId: senderWallet.id,
                receiverWalletId: receiverWallet.id,
                type: 'TRANSFER',
                amount: amountMinor.toString(),
                status: 'SUCCESS',
                description: input.description ?? null,
            });
            await txRepo.save(tx);

            return {
                transactionId: tx.id,
                senderBalance: fromMinorUnits(senderWallet.balance),
                senderBalanceMinor: senderWallet.balance,
                amount: input.amount,
                receiverName: receiver.name,
                receiverEmail: receiver.email,
            };
        });
    },
};
