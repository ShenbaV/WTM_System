import { z } from 'zod';

export const lookupSchema = z.object({
    email: z.string().trim().toLowerCase().email('Invalid email'),
});

export type LookupInput = z.infer<typeof lookupSchema>;
