import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { walletService } from '../services/wallet.service';
import { extractErrorMessage } from '../services/api';

export const walletKeys = {
    all: ['wallet'] as const,
};

export function useWallet() {
    return useQuery({
        queryKey: walletKeys.all,
        queryFn: walletService.getWallet,
        staleTime: 10_000,
    });
}

export function useAddMoney() {
    const qc = useQueryClient();
    const { enqueueSnackbar } = useSnackbar();
    return useMutation({
        mutationFn: (amount: number) => walletService.addMoney(amount),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: walletKeys.all });
            qc.invalidateQueries({ queryKey: ['transactions'] });
            enqueueSnackbar('Money added to your wallet', { variant: 'success' });
        },
        onError: (err) => {
            enqueueSnackbar(extractErrorMessage(err, 'Could not add money'), {
                variant: 'error',
            });
        },
    });
}

export function useTransfer() {
    const qc = useQueryClient();
    const { enqueueSnackbar } = useSnackbar();
    return useMutation({
        mutationFn: walletService.transfer,
        onSuccess: (data) => {
            qc.invalidateQueries({ queryKey: walletKeys.all });
            qc.invalidateQueries({ queryKey: ['transactions'] });
            enqueueSnackbar(`Sent to ${data.receiverName}`, { variant: 'success' });
        },
        onError: (err) => {
            enqueueSnackbar(extractErrorMessage(err, 'Transfer failed'), { variant: 'error' });
        },
    });
}
