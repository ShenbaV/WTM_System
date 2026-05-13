import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { userController } from './user.controller';
import { lookupSchema } from './user.validation';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /api/users/lookup:
 *   get:
 *     tags: [Users]
 *     summary: Look up a registered user by email (for transfer recipient validation)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema: { type: string, format: email }
 *     responses:
 *       200:
 *         description: User found
 *       400:
 *         description: Invalid email
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No registered user with that email
 */
router.get('/lookup', validate(lookupSchema, 'query'), userController.lookup);

export default router;
