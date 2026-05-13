import path from 'path';
import swaggerJsdoc from 'swagger-jsdoc';

// __dirname is .../src/config in dev (ts-node-dev) and .../dist/config in prod.
// Glob the sibling modules/ directory for both `.ts` and `.js` so JSDoc-driven
// route specs are discovered in either mode.
const modulesGlob = path.resolve(__dirname, '..', 'modules', '**', '*.routes.{ts,js}');

// `servers` is intentionally omitted here — it's injected per request in app.ts
// based on the incoming Host / X-Forwarded-* headers so the Swagger UI always
// targets whatever URL the docs are being served from (localhost, Render, etc).
export const swaggerSpec = swaggerJsdoc({
    definition: {
        openapi: '3.0.3',
        info: {
            title: 'Wallet & Transaction Management API',
            version: '1.0.0',
            description:
                'REST API for the Wallet & Transaction Management System. ' +
                'Money amounts are accepted as major units (e.g. rupees) in HTTP payloads ' +
                'and stored internally as BIGINT minor units (paise).',
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        tags: [
            { name: 'Auth' },
            { name: 'Users' },
            { name: 'Wallet' },
            { name: 'Transactions' },
        ],
    },
    apis: [modulesGlob],
});
