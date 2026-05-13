import bcrypt from 'bcrypt';
import { withTransaction } from '../../config/db';
import { ApiError } from '../../utils/ApiError';
import { signToken } from '../../utils/jwt';
import { AuthResponse, PublicUser, UserRow } from './auth.types';
import { LoginInput, RegisterInput } from './auth.validation';

const SALT_ROUNDS = 10;

function toPublicUser(row: UserRow): PublicUser {
    return {
        id: row.id,
        name: row.name,
        email: row.email,
        createdAt: row.created_at,
    };
}

export const authService = {
    async register(input: RegisterInput): Promise<AuthResponse> {
        const { name, email, password } = input;
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        // We create the user AND their wallet inside a single DB transaction so
        // a user never exists without a wallet.
        const user = await withTransaction(async (client) => {
            const existing = await client.query<UserRow>(
                'SELECT id FROM users WHERE email = $1',
                [email]
            );
            if (existing.rowCount && existing.rowCount > 0) {
                throw ApiError.conflict('Email is already registered');
            }

            const inserted = await client.query<UserRow>(
                `INSERT INTO users (name, email, password_hash)
                 VALUES ($1, $2, $3)
                 RETURNING id, name, email, password_hash, created_at`,
                [name, email, passwordHash]
            );
            const userRow = inserted.rows[0];

            await client.query(
                'INSERT INTO wallets (user_id, balance) VALUES ($1, 0)',
                [userRow.id]
            );

            return userRow;
        });

        const token = signToken({ id: user.id, email: user.email });
        return { token, user: toPublicUser(user) };
    },

    async login(input: LoginInput): Promise<AuthResponse> {
        const { email, password } = input;
        const result = await withTransaction(async (client) => {
            return client.query<UserRow>(
                `SELECT id, name, email, password_hash, created_at
                 FROM users WHERE email = $1`,
                [email]
            );
        });

        const user = result.rows[0];
        if (!user) {
            throw ApiError.unauthorized('Invalid credentials');
        }

        const ok = await bcrypt.compare(password, user.password_hash);
        if (!ok) {
            throw ApiError.unauthorized('Invalid credentials');
        }

        const token = signToken({ id: user.id, email: user.email });
        return { token, user: toPublicUser(user) };
    },
};
