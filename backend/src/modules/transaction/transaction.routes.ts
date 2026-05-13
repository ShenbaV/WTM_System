import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { transactionController } from './transaction.controller';
import { listTransactionsSchema } from './transaction.validation';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /api/transactions:
 *   get:
 *     tags: [Transactions]
 *     summary: List transactions for the authenticated user (most recent first)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50, maximum: 100 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, default: 0 }
 *     responses:
 *       200: { description: List of transactions }
 *       401: { description: Unauthorized }
 */
router.get('/', validate(listTransactionsSchema, 'query'), transactionController.list);

export default router;
