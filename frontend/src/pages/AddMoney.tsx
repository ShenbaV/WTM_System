import { useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Divider,
    Paper,
    Stack,
    Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBackRounded';
import { useNavigate } from 'react-router-dom';
import BalanceCard from '../components/BalanceCard';
import CurrencyInput from '../components/CurrencyInput';
import { useAddMoney, useWallet } from '../hooks/useWallet';
import { authStore } from '../store/auth';
import { formatCurrency } from '../utils/format';

const QUICK = [100, 500, 1000, 2000, 5000];

export default function AddMoney() {
    const navigate = useNavigate();
    const user = authStore.getUser();
    const [amount, setAmount] = useState('');
    const [error, setError] = useState<string | null>(null);

    const { data: wallet, isLoading: walletLoading } = useWallet();
    const { mutate, isPending } = useAddMoney();

    const numeric = Number(amount);
    const isValid = Number.isFinite(numeric) && numeric > 0;
    const projected = useMemo(() => {
        if (!wallet) return null;
        if (!isValid) return wallet.balance;
        return wallet.balance + numeric;
    }, [wallet, isValid, numeric]);

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValid) {
            setError('Enter an amount greater than 0');
            return;
        }
        setError(null);
        mutate(numeric, {
            onSuccess: () => {
                setAmount('');
                navigate('/dashboard');
            },
        });
    };

    return (
        <Stack spacing={3}>
            <Box>
                <Button
                    onClick={() => navigate(-1)}
                    startIcon={<ArrowBackIcon />}
                    sx={{ mb: 1, ml: -1 }}
                    size="small"
                >
                    Back
                </Button>
                <Typography variant="h4" fontWeight={800}>
                    Add money
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Top up your wallet balance instantly.
                </Typography>
            </Box>

            <BalanceCard
                balance={wallet?.balance}
                loading={walletLoading}
                name={user?.name}
                email={user?.email}
            />

            <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 3 } }}>
                <form onSubmit={onSubmit} noValidate>
                    <Stack spacing={3}>
                        <Box>
                            <Typography
                                variant="overline"
                                color="text.secondary"
                                display="block"
                                gutterBottom
                            >
                                Quick amounts
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                {QUICK.map((q) => (
                                    <Chip
                                        key={q}
                                        label={formatCurrency(q)}
                                        onClick={() => {
                                            setAmount(String(q));
                                            setError(null);
                                        }}
                                        color={amount === String(q) ? 'primary' : 'default'}
                                        variant={amount === String(q) ? 'filled' : 'outlined'}
                                        clickable
                                        sx={{ borderRadius: 1.5 }}
                                    />
                                ))}
                            </Stack>
                        </Box>

                        <CurrencyInput
                            label="Amount"
                            value={amount}
                            onValueChange={(v) => {
                                setAmount(v);
                                if (error) setError(null);
                            }}
                            error={Boolean(error)}
                            helperText={error ?? 'Enter the amount you want to add.'}
                            fullWidth
                            autoFocus
                        />

                        {isValid && (
                            <Alert
                                severity="info"
                                icon={false}
                                sx={{ borderRadius: 2, alignItems: 'center' }}
                            >
                                <Stack
                                    direction="row"
                                    justifyContent="space-between"
                                    alignItems="center"
                                >
                                    <Typography variant="body2">
                                        New balance after top-up
                                    </Typography>
                                    <Typography variant="subtitle1" fontWeight={700}>
                                        {formatCurrency(projected ?? 0)}
                                    </Typography>
                                </Stack>
                            </Alert>
                        )}

                        <Divider />

                        <Stack direction="row" spacing={2} justifyContent="flex-end">
                            <Button onClick={() => navigate('/dashboard')} disabled={isPending}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={isPending || !isValid}
                                startIcon={
                                    isPending ? (
                                        <CircularProgress size={18} color="inherit" />
                                    ) : undefined
                                }
                            >
                                {isPending
                                    ? 'Adding…'
                                    : isValid
                                      ? `Add ${formatCurrency(numeric)}`
                                      : 'Add money'}
                            </Button>
                        </Stack>
                    </Stack>
                </form>
            </Paper>
        </Stack>
    );
}
