import { useQuery } from '@tanstack/react-query';
import { transactionService } from '../services/transaction.service';

export function useTransactions(opts?: { limit?: number; offset?: number }) {
    return useQuery({
        queryKey: ['transactions', opts ?? {}],
        queryFn: () => transactionService.list(opts),
        staleTime: 5_000,
    });
}
