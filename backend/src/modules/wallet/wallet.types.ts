export interface WalletDto {
    id: string;
    userId: string;
    balance: number;      // major units (e.g. 100.50)
    balanceMinor: string; // raw minor units as string (paise / cents)
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
