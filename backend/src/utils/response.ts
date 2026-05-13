import { Response } from 'express';
import { ApiResponse } from '../types';

export function ok<T>(res: Response, data: T, message = 'OK', status = 200) {
    const body: ApiResponse<T> = { success: true, message, data };
    return res.status(status).json(body);
}

export function created<T>(res: Response, data: T, message = 'Created') {
    return ok(res, data, message, 201);
}

export function fail(res: Response, status: number, message: string, error?: unknown) {
    const body: ApiResponse = { success: false, message, error };
    return res.status(status).json(body);
}
