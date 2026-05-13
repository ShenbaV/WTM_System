import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { created, ok } from '../../utils/response';
import { authService } from './auth.service';
import { LoginInput, RegisterInput } from './auth.validation';

export const authController = {
    register: asyncHandler(async (req: Request, res: Response) => {
        const result = await authService.register(req.body as RegisterInput);
        return created(res, result, 'Registration successful');
    }),

    login: asyncHandler(async (req: Request, res: Response) => {
        const result = await authService.login(req.body as LoginInput);
        return ok(res, result, 'Login successful');
    }),
};
