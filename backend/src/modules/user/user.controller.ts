import { Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ok } from '../../utils/response';
import { ApiError } from '../../utils/ApiError';
import { AuthRequest } from '../../types';
import { userService } from './user.service';
import { LookupInput } from './user.validation';

export const userController = {
    lookup: asyncHandler(async (req: AuthRequest, res: Response) => {
        if (!req.user) throw ApiError.unauthorized();
        const { email } = req.query as unknown as LookupInput;
        const result = await userService.lookupByEmail(req.user.id, email);
        return ok(res, result, 'User found');
    }),
};
