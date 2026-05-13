import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Wallet } from './Wallet.entity';

@Entity({ name: 'users' })
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 120 })
    name!: string;

    @Index('idx_users_email')
    @Column({ type: 'varchar', length: 180, unique: true })
    email!: string;

    @Column({ name: 'password_hash', type: 'text' })
    passwordHash!: string;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt!: Date;

    @OneToOne(() => Wallet, (wallet) => wallet.user)
    wallet?: Wallet;
}
