import {
    Box,
    Paper,
    Skeleton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import AddIcon from '@mui/icons-material/Add';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { Transaction } from '../types';
import { formatCurrency, formatDate, formatRelative } from '../utils/format';
import StatusBadge from './StatusBadge';
import UserAvatar from './UserAvatar';
import EmptyState from './EmptyState';

interface Props {
    items?: Transaction[];
    loading?: boolean;
    emptyTitle?: string;
    emptyDescription?: string;
    emptyActionHref?: string;
    emptyActionLabel?: string;
    dense?: boolean;
}

function txCounterparty(tx: Transaction): {
    name: string;
    email: string | null;
    sublabel: string;
} {
    if (tx.type === 'DEPOSIT') {
        return { name: 'Wallet top-up', email: null, sublabel: 'Deposit' };
    }
    if (tx.direction === 'CREDIT' && tx.sender) {
        return { name: tx.sender.name, email: tx.sender.email, sublabel: 'From' };
    }
    if (tx.direction === 'DEBIT' && tx.receiver) {
        return { name: tx.receiver.name, email: tx.receiver.email, sublabel: 'To' };
    }
    return { name: '—', email: null, sublabel: '' };
}

function TxIcon({ tx }: { tx: Transaction }) {
    if (tx.type === 'DEPOSIT') {
        return (
            <Box
                sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    bgcolor: (t) => t.palette.success.main + '1F',
                    color: 'success.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <AddIcon fontSize="small" />
            </Box>
        );
    }
    const isCredit = tx.direction === 'CREDIT';
    return (
        <Box
            sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                bgcolor: (t) =>
                    (isCredit ? t.palette.success.main : t.palette.error.main) + '1F',
                color: isCredit ? 'success.main' : 'error.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {isCredit ? (
                <ArrowDownwardIcon fontSize="small" />
            ) : (
                <ArrowUpwardIcon fontSize="small" />
            )}
        </Box>
    );
}

function AmountText({ tx }: { tx: Transaction }) {
    const isCredit = tx.direction === 'CREDIT';
    return (
        <Typography
            variant="subtitle2"
            fontWeight={700}
            color={isCredit ? 'success.main' : 'error.main'}
            sx={{ whiteSpace: 'nowrap' }}
        >
            {isCredit ? '+' : '−'} {formatCurrency(tx.amount)}
        </Typography>
    );
}

function TableSkeleton() {
    return (
        <TableContainer component={Paper} variant="outlined">
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Transaction</TableCell>
                        <TableCell>Counterparty</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Date</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {[...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                            <TableCell>
                                <Skeleton width={140} />
                            </TableCell>
                            <TableCell>
                                <Skeleton width={180} />
                            </TableCell>
                            <TableCell align="right">
                                <Skeleton width={80} />
                            </TableCell>
                            <TableCell>
                                <Skeleton width={80} height={28} />
                            </TableCell>
                            <TableCell align="right">
                                <Skeleton width={100} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

function MobileSkeleton() {
    return (
        <Stack spacing={1.5}>
            {[...Array(4)].map((_, i) => (
                <Paper variant="outlined" key={i} sx={{ p: 2 }}>
                    <Stack direction="row" spacing={2}>
                        <Skeleton variant="rectangular" width={36} height={36} sx={{ borderRadius: 2 }} />
                        <Stack flex={1} spacing={0.5}>
                            <Skeleton width="60%" />
                            <Skeleton width="40%" />
                        </Stack>
                        <Skeleton width={70} />
                    </Stack>
                </Paper>
            ))}
        </Stack>
    );
}

export default function TransactionsTable({
    items,
    loading,
    emptyTitle = 'No transactions yet',
    emptyDescription = 'Top up your wallet or send money to get started.',
    emptyActionHref,
    emptyActionLabel,
    dense,
}: Props) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    if (loading) return isMobile ? <MobileSkeleton /> : <TableSkeleton />;

    if (!items || items.length === 0) {
        return (
            <EmptyState
                icon={<ReceiptLongIcon fontSize="large" />}
                title={emptyTitle}
                description={emptyDescription}
                actionHref={emptyActionHref}
                actionLabel={emptyActionLabel}
            />
        );
    }

    if (isMobile) {
        return (
            <Stack spacing={1.5}>
                {items.map((tx) => {
                    const cp = txCounterparty(tx);
                    return (
                        <Paper variant="outlined" key={tx.id} sx={{ p: 2 }}>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                                <TxIcon tx={tx} />
                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                    <Typography
                                        variant="subtitle2"
                                        fontWeight={700}
                                        noWrap
                                    >
                                        {cp.name}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{
                                            display: 'block',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {tx.type === 'DEPOSIT'
                                            ? 'Top-up'
                                            : `${cp.sublabel} ${cp.email ?? ''}`}
                                    </Typography>
                                </Box>
                                <Stack alignItems="flex-end" spacing={0.25}>
                                    <AmountText tx={tx} />
                                    <Typography variant="caption" color="text.secondary">
                                        {formatRelative(tx.createdAt)}
                                    </Typography>
                                </Stack>
                            </Stack>
                            {tx.description && (
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{
                                        display: 'block',
                                        mt: 1,
                                        pl: 6.5,
                                    }}
                                >
                                    “{tx.description}”
                                </Typography>
                            )}
                            <Box sx={{ mt: 1, pl: 6.5 }}>
                                <StatusBadge status={tx.status} />
                            </Box>
                        </Paper>
                    );
                })}
            </Stack>
        );
    }

    return (
        <TableContainer component={Paper} variant="outlined">
            <Table size={dense ? 'small' : 'medium'}>
                <TableHead>
                    <TableRow>
                        <TableCell>Transaction</TableCell>
                        <TableCell>Counterparty</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Date</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {items.map((tx) => {
                        const cp = txCounterparty(tx);
                        const isTransfer = tx.type === 'TRANSFER';
                        return (
                            <TableRow key={tx.id} hover>
                                <TableCell>
                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                        <TxIcon tx={tx} />
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight={700}>
                                                {tx.type === 'DEPOSIT'
                                                    ? 'Wallet top-up'
                                                    : tx.direction === 'CREDIT'
                                                      ? 'Money received'
                                                      : 'Money sent'}
                                            </Typography>
                                            {tx.description && (
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                >
                                                    {tx.description}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Stack>
                                </TableCell>
                                <TableCell>
                                    {isTransfer ? (
                                        <Stack direction="row" spacing={1.25} alignItems="center">
                                            <UserAvatar
                                                name={cp.name}
                                                email={cp.email ?? undefined}
                                                size={32}
                                            />
                                            <Box sx={{ minWidth: 0 }}>
                                                <Typography
                                                    variant="body2"
                                                    fontWeight={600}
                                                    noWrap
                                                    sx={{ maxWidth: 220 }}
                                                >
                                                    {cp.name}
                                                </Typography>
                                                {cp.email && (
                                                    <Tooltip title={cp.email}>
                                                        <Typography
                                                            variant="caption"
                                                            color="text.secondary"
                                                            sx={{
                                                                display: 'block',
                                                                maxWidth: 220,
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap',
                                                            }}
                                                        >
                                                            {cp.email}
                                                        </Typography>
                                                    </Tooltip>
                                                )}
                                            </Box>
                                        </Stack>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">
                                            Self deposit
                                        </Typography>
                                    )}
                                </TableCell>
                                <TableCell align="right">
                                    <AmountText tx={tx} />
                                </TableCell>
                                <TableCell>
                                    <StatusBadge status={tx.status} />
                                </TableCell>
                                <TableCell align="right">
                                    <Tooltip title={formatDate(tx.createdAt)}>
                                        <Typography variant="caption" color="text.secondary">
                                            {formatRelative(tx.createdAt)}
                                        </Typography>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
