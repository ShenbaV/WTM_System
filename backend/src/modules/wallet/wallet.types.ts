export interface WalletRow {
    id: string;
    user_id: string;
    balance: string; // pg returns BIGINT as string
    created_at: string;
}

export interface WalletDto {
    id: string;
    userId: string;
    balance: number;      // major units (e.g., 100.50)
    balanceMinor: string; // raw minor units as string
    createdAt: string;
}

export interface TransferResultDto {
    transactionId: string;
    senderBalance: number;
    senderBalanceMinor: string;
    amount: number;
    receiverName: string;
    receiverEmail: string;
}
