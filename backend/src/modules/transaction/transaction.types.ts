export type TransactionType = 'DEPOSIT' | 'TRANSFER';
export type TransactionStatus = 'SUCCESS' | 'FAILED' | 'PENDING';

export interface TransactionRow {
    id: string;
    sender_wallet_id: string | null;
    receiver_wallet_id: string | null;
    type: TransactionType;
    amount: string;
    status: TransactionStatus;
    description: string | null;
    created_at: string;
    sender_name: string | null;
    sender_email: string | null;
    receiver_name: string | null;
    receiver_email: string | null;
}

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
