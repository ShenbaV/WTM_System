import {
    Check,
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Wallet } from './Wallet.entity';

export type TransactionType = 'DEPOSIT' | 'TRANSFER';
export type TransactionStatus = 'SUCCESS' | 'FAILED' | 'PENDING';

@Entity({ name: 'transactions' })
@Check('tx_type', `"type" IN ('DEPOSIT', 'TRANSFER')`)
@Check('tx_status', `"status" IN ('SUCCESS', 'FAILED', 'PENDING')`)
@Check('tx_amount_positive', '"amount" > 0')
export class Transaction {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Index('idx_tx_sender')
    @Column({ name: 'sender_wallet_id', type: 'uuid', nullable: true })
    senderWalletId!: string | null;

    @ManyToOne(() => Wallet, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'sender_wallet_id' })
    senderWallet?: Wallet | null;

    @Index('idx_tx_receiver')
    @Column({ name: 'receiver_wallet_id', type: 'uuid', nullable: true })
    receiverWalletId!: string | null;

    @ManyToOne(() => Wallet, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'receiver_wallet_id' })
    receiverWallet?: Wallet | null;

    @Column({ type: 'varchar', length: 20 })
    type!: TransactionType;

    @Column({ type: 'bigint' })
    amount!: string;

    @Column({ type: 'varchar', length: 20 })
    status!: TransactionStatus;

    @Column({ type: 'text', nullable: true })
    description!: string | null;

    @Index('idx_tx_created')
    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt!: Date;
}
