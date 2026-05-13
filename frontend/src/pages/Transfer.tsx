import { useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Divider,
    Paper,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBackRounded';
import SendIcon from '@mui/icons-material/SendRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import { useNavigate } from 'react-router-dom';
import BalanceCard from '../components/BalanceCard';
import CurrencyInput from '../components/CurrencyInput';
import ConfirmDialog from '../components/ConfirmDialog';
import UserAvatar from '../components/UserAvatar';
import { useTransfer, useWallet } from '../hooks/useWallet';
import { useUserLookup } from '../hooks/useUserLookup';
import { authStore } from '../store/auth';
import { formatCurrency } from '../utils/format';

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Transfer() {
    const navigate = useNavigate();
    const user = authStore.getUser();
    const [receiverEmail, setReceiverEmail] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [confirmOpen, setConfirmOpen] = useState(false);

    const { data: wallet, isLoading } = useWallet();
    const { mutate, isPending } = useTransfer();
    const lookup = useUserLookup(receiverEmail);

    const numeric = Number(amount);
    const isAmountValid = Number.isFinite(numeric) && numeric > 0;
    const insufficient =
        Boolean(wallet) && isAmountValid && numeric > (wallet?.balance ?? 0);
    const remaining = wallet
        ? Math.max(0, wallet.balance - (isAmountValid ? numeric : 0))
        : 0;

    const emailLooksValid = EMAIL_RX.test(receiverEmail.trim());
    const isSelf =
        Boolean(user) &&
        emailLooksValid &&
        receiverEmail.trim().toLowerCase() === user!.email.toLowerCase();
    // Server-side authoritative self check (different email casing or alias).
    const lookupIsSelf = lookup.user?.isSelf ?? false;

    // Field-level state for the receiver input.
    const receiverState: {
        kind: 'idle' | 'invalid' | 'self' | 'loading' | 'found' | 'not_found';
        message?: string;
    } = useMemo(() => {
        if (!receiverEmail.trim()) return { kind: 'idle' };
        if (!emailLooksValid)
            return { kind: 'invalid', message: 'Enter a valid email address' };
        if (isSelf || lookupIsSelf)
            return { kind: 'self', message: 'You cannot transfer money to yourself' };
        if (lookup.isLoading) return { kind: 'loading' };
        if (lookup.notFound)
            return {
                kind: 'not_found',
                message: 'No registered user with this email',
            };
        if (lookup.user)
            return { kind: 'found', message: `Sending to ${lookup.user.name}` };
        return { kind: 'idle' };
    }, [
        receiverEmail,
        emailLooksValid,
        isSelf,
        lookupIsSelf,
        lookup.isLoading,
        lookup.notFound,
        lookup.user,
    ]);

    const canSubmit =
        !isPending &&
        receiverState.kind === 'found' &&
        isAmountValid &&
        !insufficient;

    const onAskConfirm = (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;
        setConfirmOpen(true);
    };

    const onConfirm = () => {
        mutate(
            {
                receiverEmail: receiverEmail.trim(),
                amount: numeric,
                description: description.trim() || undefined,
            },
            {
                onSuccess: () => {
                    setConfirmOpen(false);
                    navigate('/transactions');
                },
                onError: () => {
                    setConfirmOpen(false);
                },
            }
        );
    };

    // Status icon shown on the right side of the email field.
    const receiverAdornment = () => {
        if (receiverState.kind === 'loading')
            return <CircularProgress size={18} thickness={5} />;
        if (receiverState.kind === 'found')
            return <CheckCircleRoundedIcon color="success" fontSize="small" />;
        if (
            receiverState.kind === 'not_found' ||
            receiverState.kind === 'self' ||
            receiverState.kind === 'invalid'
        )
            return <ErrorOutlineRoundedIcon color="error" fontSize="small" />;
        return null;
    };

    const helperText =
        receiverState.kind === 'found'
            ? `${lookup.user!.name} • verified`
            : receiverState.kind === 'loading'
              ? 'Looking up recipient…'
              : receiverState.message ??
                'The recipient must already have a Wallet account.';

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
                    Send money
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Transfer money to another registered user by email.
                </Typography>
            </Box>

            <BalanceCard
                balance={wallet?.balance}
                loading={isLoading}
                name={user?.name}
                email={user?.email}
            />

            <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 3 } }}>
                <form onSubmit={onAskConfirm} noValidate>
                    <Stack spacing={3}>
                        <Box>
                            <TextField
                                label="Receiver email"
                                type="email"
                                value={receiverEmail}
                                onChange={(e) => setReceiverEmail(e.target.value)}
                                placeholder="name@example.com"
                                fullWidth
                                autoComplete="email"
                                autoFocus
                                error={
                                    receiverState.kind === 'invalid' ||
                                    receiverState.kind === 'self' ||
                                    receiverState.kind === 'not_found'
                                }
                                color={
                                    receiverState.kind === 'found' ? 'success' : undefined
                                }
                                helperText={helperText}
                                InputProps={{
                                    endAdornment: (
                                        <Box sx={{ display: 'flex', pr: 0.5 }}>
                                            {receiverAdornment()}
                                        </Box>
                                    ),
                                }}
                            />
                            {receiverState.kind === 'found' && lookup.user && (
                                <Paper
                                    variant="outlined"
                                    sx={{
                                        mt: 1.5,
                                        p: 1.5,
                                        borderRadius: 2,
                                        bgcolor: 'success.main',
                                        borderColor: 'success.main',
                                        color: 'common.white',
                                    }}
                                >
                                    <Stack
                                        direction="row"
                                        spacing={1.5}
                                        alignItems="center"
                                    >
                                        <UserAvatar
                                            name={lookup.user.name}
                                            email={lookup.user.email}
                                            size={36}
                                        />
                                        <Box sx={{ minWidth: 0, flex: 1 }}>
                                            <Typography
                                                variant="caption"
                                                sx={{ opacity: 0.85 }}
                                            >
                                                Recipient
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                fontWeight={700}
                                                noWrap
                                            >
                                                {lookup.user.name}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    display: 'block',
                                                    opacity: 0.9,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {lookup.user.email}
                                            </Typography>
                                        </Box>
                                        <CheckCircleRoundedIcon />
                                    </Stack>
                                </Paper>
                            )}
                        </Box>

                        <CurrencyInput
                            label="Amount"
                            value={amount}
                            onValueChange={(v) => setAmount(v)}
                            error={insufficient}
                            helperText={
                                insufficient
                                    ? 'Insufficient balance'
                                    : isAmountValid
                                      ? ' '
                                      : 'Enter an amount greater than 0'
                            }
                            fullWidth
                        />

                        <TextField
                            label="Note (optional)"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            multiline
                            minRows={2}
                            inputProps={{ maxLength: 255 }}
                            placeholder="e.g. Lunch on Friday"
                            fullWidth
                        />

                        {insufficient && (
                            <Alert severity="warning" sx={{ borderRadius: 2 }}>
                                You don&apos;t have enough balance.{' '}
                                <Button
                                    size="small"
                                    onClick={() => navigate('/add-money')}
                                    sx={{ ml: 1 }}
                                >
                                    Add money
                                </Button>
                            </Alert>
                        )}

                        {isAmountValid &&
                            !insufficient &&
                            receiverState.kind === 'found' && (
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
                                            Remaining balance
                                        </Typography>
                                        <Typography variant="subtitle1" fontWeight={700}>
                                            {formatCurrency(remaining)}
                                        </Typography>
                                    </Stack>
                                </Alert>
                            )}

                        <Divider />

                        <Stack direction="row" spacing={2} justifyContent="flex-end">
                            <Button
                                onClick={() => navigate('/dashboard')}
                                disabled={isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={!canSubmit}
                                endIcon={<SendIcon />}
                            >
                                {isAmountValid && !insufficient
                                    ? `Review · ${formatCurrency(numeric)}`
                                    : 'Review transfer'}
                            </Button>
                        </Stack>
                    </Stack>
                </form>
            </Paper>

            <ConfirmDialog
                open={confirmOpen}
                title="Confirm transfer"
                description="Review the details before sending. This action cannot be undone."
                confirmLabel={
                    isPending ? 'Sending…' : `Send ${formatCurrency(numeric || 0)}`
                }
                cancelLabel="Back"
                busy={isPending}
                onClose={() => (isPending ? null : setConfirmOpen(false))}
                onConfirm={onConfirm}
            >
                <Paper
                    variant="outlined"
                    sx={{ p: 2, borderRadius: 2, bgcolor: 'background.default' }}
                >
                    <Stack direction="row" spacing={2} alignItems="center">
                        <UserAvatar
                            name={lookup.user?.name}
                            email={lookup.user?.email ?? receiverEmail}
                            size={40}
                        />
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                                Sending to
                            </Typography>
                            <Typography variant="body2" fontWeight={700} noWrap>
                                {lookup.user?.name ?? receiverEmail}
                            </Typography>
                            {lookup.user && (
                                <Typography variant="caption" color="text.secondary">
                                    {lookup.user.email}
                                </Typography>
                            )}
                        </Box>
                    </Stack>
                </Paper>
                <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                        Amount
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={700}>
                        {formatCurrency(numeric || 0)}
                    </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                        Balance after
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                        {formatCurrency(remaining)}
                    </Typography>
                </Stack>
                {description && (
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                    >
                        <Typography variant="body2" color="text.secondary">
                            Note
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{ maxWidth: 220, textAlign: 'right' }}
                        >
                            {description}
                        </Typography>
                    </Stack>
                )}
            </ConfirmDialog>
        </Stack>
    );
}
