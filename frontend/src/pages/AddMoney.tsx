import { useState } from 'react';
import {
    Box,
    Button,
    Chip,
    Paper,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import BalanceCard from '../components/BalanceCard';
import { useAddMoney, useWallet } from '../hooks/useWallet';
import { authStore } from '../store/auth';

const QUICK_AMOUNTS = [100, 500, 1000, 2000];

export default function AddMoney() {
    const navigate = useNavigate();
    const user = authStore.getUser();
    const [amount, setAmount] = useState('');
    const [error, setError] = useState<string | null>(null);

    const { data: wallet, isLoading } = useWallet();
    const { mutate, isPending } = useAddMoney();

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const value = Number(amount);
        if (!Number.isFinite(value) || value <= 0) {
            setError('Enter an amount greater than 0');
            return;
        }
        setError(null);
        mutate(value, {
            onSuccess: () => {
                setAmount('');
                navigate('/dashboard');
            },
        });
    };

    return (
        <Stack spacing={3}>
            <Box>
                <Typography variant="h4" fontWeight={700}>
                    Add money
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Top up your wallet balance.
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
                        <Typography variant="overline" color="text.secondary">
                            Quick amounts
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {QUICK_AMOUNTS.map((q) => (
                                <Chip
                                    key={q}
                                    label={`+ ₹${q}`}
                                    onClick={() => setAmount(String(q))}
                                    clickable
                                    color={amount === String(q) ? 'primary' : 'default'}
                                />
                            ))}
                        </Stack>

                        <TextField
                            label="Amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            error={Boolean(error)}
                            helperText={error}
                            inputProps={{ min: 0, step: 0.01 }}
                            fullWidth
                        />

                        <Stack direction="row" spacing={2} justifyContent="flex-end">
                            <Button onClick={() => navigate('/dashboard')} disabled={isPending}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={isPending}
                            >
                                {isPending ? 'Adding…' : 'Add money'}
                            </Button>
                        </Stack>
                    </Stack>
                </form>
            </Paper>
        </Stack>
    );
}
