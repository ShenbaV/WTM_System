import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { walletController } from './wallet.controller';
import { addMoneySchema, transferSchema } from './wallet.validation';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /api/wallet:
 *   get:
 *     tags: [Wallet]
 *     summary: Get the authenticated user's wallet
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Wallet fetched }
 *       401: { description: Unauthorized }
 */
router.get('/', walletController.getWallet);

/**
 * @openapi
 * /api/wallet/add-money:
 *   post:
 *     tags: [Wallet]
 *     summary: Add money to the authenticated user's wallet
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount]
 *             properties:
 *               amount: { type: number, example: 500.50, description: "Amount in major currency units" }
 *     responses:
 *       200: { description: Money added }
 *       400: { description: Validation error }
 *       401: { description: Unauthorized }
 */
router.post('/add-money', validate(addMoneySchema), walletController.addMoney);

/**
 * @openapi
 * /api/wallet/transfer:
 *   post:
 *     tags: [Wallet]
 *     summary: Transfer money to another user (by email)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [receiverEmail, amount]
 *             properties:
 *               receiverEmail: { type: string, format: email }
 *               amount:        { type: number, example: 250 }
 *               description:   { type: string, example: "Lunch split" }
 *     responses:
 *       200: { description: Transfer completed }
 *       400: { description: Invalid transfer (self-transfer, insufficient balance, etc.) }
 *       401: { description: Unauthorized }
 *       404: { description: Receiver not found }
 */
router.post('/transfer', validate(transferSchema), walletController.transfer);

export default router;
