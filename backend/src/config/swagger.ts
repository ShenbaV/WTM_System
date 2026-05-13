import path from 'path';
import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env';

// __dirname is .../src/config in dev (ts-node-dev) and .../dist/config in prod.
// Glob the sibling modules/ directory for both `.ts` and `.js` so JSDoc-driven
// route specs are discovered in either mode.
const modulesGlob = path.resolve(__dirname, '..', 'modules', '**', '*.routes.{ts,js}');

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
        servers: [{ url: `http://localhost:${env.PORT}`, description: 'Local' }],
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
