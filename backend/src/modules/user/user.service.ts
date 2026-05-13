import { AppDataSource } from '../../config/data-source';
import { User } from '../../entities/User.entity';
import { ApiError } from '../../utils/ApiError';

export interface UserLookupDto {
    id: string;
    name: string;
    email: string;
    isSelf: boolean;
}

export const userService = {
    /**
     * Look up a registered user by email. Used by the transfer form to
     * confirm the recipient exists (and isn't the caller) before submission.
     *
     * Returns 404 instead of an empty body if the email isn't registered, so
     * the frontend can show a clear inline error.
     */
    async lookupByEmail(callerUserId: string, email: string): Promise<UserLookupDto> {
        const repo = AppDataSource.getRepository(User);
        const user = await repo.findOne({
            where: { email },
            select: { id: true, name: true, email: true },
        });
        if (!user) {
            throw ApiError.notFound('No registered user with that email');
        }
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            isSelf: user.id === callerUserId,
        };
    },
};
