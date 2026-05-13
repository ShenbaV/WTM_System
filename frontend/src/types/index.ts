export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    error?: unknown;
}

export interface PublicUser {
    id: string;
    name: string;
    email: string;
    createdAt: string;
}

export interface AuthResponse {
    token: string;
    user: PublicUser;
}

export interface Wallet {
    id: string;
    userId: string;
    balance: number;
    balanceMinor: string;
    createdAt: string;
}

export type TransactionType = 'DEPOSIT' | 'TRANSFER';
export type TransactionStatus = 'SUCCESS' | 'FAILED' | 'PENDING';

export interface TransactionParty {
    name: string;
    email: string;
}

export interface Transaction {
    id: string;
    type: TransactionType;
    status: TransactionStatus;
    amount: number;
    amountMinor: string;
    description: string | null;
    createdAt: string;
    direction: 'CREDIT' | 'DEBIT';
    sender: TransactionParty | null;
    receiver: TransactionParty | null;
}

export interface TransactionListResult {
    transactions: Transaction[];
    total: number;
}

export interface TransferResult {
    transactionId: string;
    senderBalance: number;
    senderBalanceMinor: string;
    amount: number;
    receiverName: string;
    receiverEmail: string;
}
