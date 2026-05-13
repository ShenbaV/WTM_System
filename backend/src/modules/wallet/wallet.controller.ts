import { Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ok } from '../../utils/response';
import { AuthRequest } from '../../types';
import { ApiError } from '../../utils/ApiError';
import { walletService } from './wallet.service';
import { AddMoneyInput, TransferInput } from './wallet.validation';

export const walletController = {
    getWallet: asyncHandler(async (req: AuthRequest, res: Response) => {
        if (!req.user) throw ApiError.unauthorized();
        const wallet = await walletService.getWalletByUser(req.user.id);
        return ok(res, wallet, 'Wallet fetched');
    }),

    addMoney: asyncHandler(async (req: AuthRequest, res: Response) => {
        if (!req.user) throw ApiError.unauthorized();
        const wallet = await walletService.addMoney(req.user.id, req.body as AddMoneyInput);
        return ok(res, wallet, 'Money added successfully');
    }),

    transfer: asyncHandler(async (req: AuthRequest, res: Response) => {
        if (!req.user) throw ApiError.unauthorized();
        const result = await walletService.transfer(
            req.user.id,
            req.user.email,
            req.body as TransferInput
        );
        return ok(res, result, 'Transfer completed successfully');
    }),
};
