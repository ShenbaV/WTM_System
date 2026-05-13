import { Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ok } from '../../utils/response';
import { AuthRequest } from '../../types';
import { ApiError } from '../../utils/ApiError';
import { transactionService } from './transaction.service';
import { ListTransactionsInput } from './transaction.validation';

export const transactionController = {
    list: asyncHandler(async (req: AuthRequest, res: Response) => {
        if (!req.user) throw ApiError.unauthorized();
        const opts = req.query as unknown as ListTransactionsInput;
        const result = await transactionService.listForUser(req.user.id, opts);
        return ok(res, result, 'Transactions fetched');
    }),
};
