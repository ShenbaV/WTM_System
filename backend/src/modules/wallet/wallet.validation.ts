import { z } from 'zod';

export const addMoneySchema = z.object({
    amount: z
        .number({ invalid_type_error: 'Amount must be a number' })
        .positive('Amount must be greater than zero')
        .max(10_00_00_000, 'Amount too large'),
});

export const transferSchema = z.object({
    receiverEmail: z.string().trim().toLowerCase().email('Invalid receiver email'),
    amount: z
        .number({ invalid_type_error: 'Amount must be a number' })
        .positive('Amount must be greater than zero')
        .max(10_00_00_000, 'Amount too large'),
    description: z.string().trim().max(255).optional(),
});

export type AddMoneyInput = z.infer<typeof addMoneySchema>;
export type TransferInput = z.infer<typeof transferSchema>;
