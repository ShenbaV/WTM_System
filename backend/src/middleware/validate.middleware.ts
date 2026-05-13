import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ApiError } from '../utils/ApiError';

type Source = 'body' | 'query' | 'params';

export const validate =
    (schema: ZodSchema, source: Source = 'body') =>
    (req: Request, _res: Response, next: NextFunction) => {
        try {
            const data = schema.parse(req[source]);
            // Re-assign parsed/transformed data
            (req as unknown as Record<Source, unknown>)[source] = data;
            return next();
        } catch (err) {
            if (err instanceof ZodError) {
                const details = err.issues.map((i) => ({
                    path: i.path.join('.'),
                    message: i.message,
                }));
                return next(ApiError.badRequest('Validation failed', details));
            }
            return next(err);
        }
    };
