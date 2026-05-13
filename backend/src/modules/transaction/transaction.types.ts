export type TransactionType = 'DEPOSIT' | 'TRANSFER';
export type TransactionStatus = 'SUCCESS' | 'FAILED' | 'PENDING';

export interface TransactionDto {
    id: string;
    type: TransactionType;
    status: TransactionStatus;
    amount: number;
    amountMinor: string;
    description: string | null;
    createdAt: string;
    direction: 'CREDIT' | 'DEBIT';
    sender: { name: string; email: string } | null;
    receiver: { name: string; email: string } | null;
}
