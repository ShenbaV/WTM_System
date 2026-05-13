import { useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Paper,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import BalanceCard from '../components/BalanceCard';
import { useTransfer, useWallet } from '../hooks/useWallet';
import { authStore } from '../store/auth';

export default function Transfer() {
    const navigate = useNavigate();
    const user = authStore.getUser();
    const [receiverEmail, setReceiverEmail] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [errors, setErrors] = useState<{
        receiverEmail?: string;
        amount?: string;
    }>({});

    const { data: wallet, isLoading } = useWallet();
    const { mutate, isPending } = useTransfer();

    const insufficient = useMemo(() => {
        const a = Number(amount);
        if (!wallet || !Number.isFinite(a) || a <= 0) return false;
        return a > wallet.balance;
    }, [amount, wallet]);

    const validate = () => {
        const e: typeof errors = {};
        if (!receiverEmail.trim()) e.receiverEmail = 'Receiver email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(receiverEmail))
            e.receiverEmail = 'Invalid email';
        else if (
            user &&
            receiverEmail.trim().toLowerCase() === user.email.toLowerCase()
        )
            e.receiverEmail = 'You cannot transfer to yourself';

        const a = Number(amount);
        if (!Number.isFinite(a) || a <= 0) e.amount = 'Amount must be greater than 0';
        else if (wallet && a > wallet.balance) e.amount = 'Insufficient balance';

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        mutate(
            {
                receiverEmail: receiverEmail.trim(),
                amount: Number(amount),
                description: description.trim() || undefined,
            },
            {
                onSuccess: () => {
                    navigate('/transactions');
                },
            }
        );
    };

    return (
        <Stack spacing={3}>
            <Box>
                <Typography variant="h4" fontWeight={700}>
                    Transfer money
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Send money to another registered user.
                </Typography>
            </Box>

            <BalanceCard
                balance={wallet?.balance}
                loading={isLoading}
                name={user?.email}
            />

            <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 3 } }}>
                <form onSubmit={onSubmit} noValidate>
                    <Stack spacing={2.5}>
                        <TextField
                            label="Receiver email"
                            type="email"
                            value={receiverEmail}
                            onChange={(e) => setReceiverEmail(e.target.value)}
                            error={Boolean(errors.receiverEmail)}
                            helperText={errors.receiverEmail}
                            fullWidth
                        />
                        <TextField
                            label="Amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            error={Boolean(errors.amount)}
                            helperText={errors.amount}
                            inputProps={{ min: 0, step: 0.01 }}
                            fullWidth
                        />
                        <TextField
                            label="Note (optional)"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            multiline
                            minRows={2}
                            inputProps={{ maxLength: 255 }}
                            fullWidth
                        />

                        {insufficient && (
                            <Alert severity="warning">
                                You don&apos;t have enough balance for this transfer.
                            </Alert>
                        )}

                        <Stack direction="row" spacing={2} justifyContent="flex-end">
                            <Button onClick={() => navigate('/dashboard')} disabled={isPending}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={isPending}
                            >
                                {isPending ? 'Sending…' : 'Send money'}
                            </Button>
                        </Stack>
                    </Stack>
                </form>
            </Paper>
        </Stack>
    );
}
