import { ErrorRequestHandler, Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';

export const notFoundHandler = (_req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
};

export const errorHandler: ErrorRequestHandler = (
    err: unknown,
    _req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction
) => {
    if (err instanceof ApiError) {
        res.status(err.status).json({
            success: false,
            message: err.message,
            error: err.details,
        });
        return;
    }

    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: env.NODE_ENV === 'development' ? String(err) : undefined,
    });
};
