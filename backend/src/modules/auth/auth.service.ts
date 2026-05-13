import bcrypt from 'bcrypt';
import { AppDataSource, withTransaction } from '../../config/data-source';
import { User } from '../../entities/User.entity';
import { Wallet } from '../../entities/Wallet.entity';
import { ApiError } from '../../utils/ApiError';
import { signToken } from '../../utils/jwt';
import { AuthResponse, PublicUser } from './auth.types';
import { LoginInput, RegisterInput } from './auth.validation';

const SALT_ROUNDS = 10;

function toPublicUser(user: User): PublicUser {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt.toISOString(),
    };
}

export const authService = {
    async register(input: RegisterInput): Promise<AuthResponse> {
        const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

        // A user must never exist without a wallet — create both atomically.
        const user = await withTransaction(async (qr) => {
            const userRepo = qr.manager.getRepository(User);
            const walletRepo = qr.manager.getRepository(Wallet);

            const existing = await userRepo.findOne({
                where: { email: input.email },
                select: { id: true },
            });
            if (existing) {
                throw ApiError.conflict('Email is already registered');
            }

            const newUser = userRepo.create({
                name: input.name,
                email: input.email,
                passwordHash,
            });
            await userRepo.save(newUser);

            const wallet = walletRepo.create({
                userId: newUser.id,
                balance: '0',
            });
            await walletRepo.save(wallet);

            return newUser;
        });

        const token = signToken({ id: user.id, email: user.email });
        return { token, user: toPublicUser(user) };
    },

    async login(input: LoginInput): Promise<AuthResponse> {
        const userRepo = AppDataSource.getRepository(User);
        const user = await userRepo.findOne({ where: { email: input.email } });
        if (!user) {
            throw ApiError.unauthorized('Invalid credentials');
        }

        const valid = await bcrypt.compare(input.password, user.passwordHash);
        if (!valid) {
            throw ApiError.unauthorized('Invalid credentials');
        }

        const token = signToken({ id: user.id, email: user.email });
        return { token, user: toPublicUser(user) };
    },
};
