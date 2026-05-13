import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware';
import { authController } from './auth.controller';
import { loginSchema, registerSchema } from './auth.validation';

const router = Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user (also auto-creates a wallet)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:     { type: string, example: "Jane Doe" }
 *               email:    { type: string, format: email, example: "jane@example.com" }
 *               password: { type: string, format: password, example: "supersecret" }
 *     responses:
 *       201: { description: Registration successful }
 *       400: { description: Validation error }
 *       409: { description: Email already registered }
 */
router.post('/register', validate(registerSchema), authController.register);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email and password, returns JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:    { type: string, format: email, example: "jane@example.com" }
 *               password: { type: string, format: password, example: "supersecret" }
 *     responses:
 *       200: { description: Login successful }
 *       400: { description: Validation error }
 *       401: { description: Invalid credentials }
 */
router.post('/login', validate(loginSchema), authController.login);

export default router;
