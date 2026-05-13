import {
    Check,
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './User.entity';

/**
 * Wallet balance is stored in minor units (paise / cents) as BIGINT.
 * The pg driver returns BIGINT values as strings to avoid JS number precision
 * loss, so the `balance` property is typed as `string` here.
 */
@Entity({ name: 'wallets' })
@Check('balance_non_negative', '"balance" >= 0')
export class Wallet {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Index('idx_wallets_user_id')
    @Column({ name: 'user_id', type: 'uuid', unique: true })
    userId!: string;

    @OneToOne(() => User, (user) => user.wallet, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Column({ type: 'bigint', default: () => '0' })
    balance!: string;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt!: Date;
}
