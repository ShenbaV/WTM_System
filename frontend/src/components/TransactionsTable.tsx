import {
    Box,
    Chip,
    Paper,
    Skeleton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { Transaction } from '../types';
import { formatCurrency, formatDate } from '../utils/format';

interface Props {
    items?: Transaction[];
    loading?: boolean;
    empty?: string;
}

function StatusChip({ status }: { status: Transaction['status'] }) {
    const color: 'success' | 'error' | 'warning' =
        status === 'SUCCESS' ? 'success' : status === 'FAILED' ? 'error' : 'warning';
    return <Chip size="small" label={status} color={color} variant="outlined" />;
}

export default function TransactionsTable({ items, loading, empty }: Props) {
    if (loading) {
        return (
            <Paper variant="outlined" sx={{ p: 2 }}>
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} variant="rectangular" height={48} sx={{ my: 1 }} />
                ))}
            </Paper>
        );
    }

    if (!items || items.length === 0) {
        return (
            <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">
                    {empty ?? 'No transactions yet'}
                </Typography>
            </Paper>
        );
    }

    return (
        <TableContainer component={Paper} variant="outlined">
            <Table size="medium">
                <TableHead>
                    <TableRow>
                        <TableCell>Type</TableCell>
                        <TableCell>From</TableCell>
                        <TableCell>To</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Date</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {items.map((tx) => {
                        const isCredit = tx.direction === 'CREDIT';
                        return (
                            <TableRow key={tx.id} hover>
                                <TableCell>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        {isCredit ? (
                                            <ArrowDownwardIcon color="success" fontSize="small" />
                                        ) : (
                                            <ArrowUpwardIcon color="error" fontSize="small" />
                                        )}
                                        <Box>
                                            <Typography variant="body2" fontWeight={600}>
                                                {tx.type}
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
                                    {tx.sender ? (
                                        <Box>
                                            <Typography variant="body2">
                                                {tx.sender.name}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                {tx.sender.email}
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            —
                                        </Typography>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {tx.receiver ? (
                                        <Box>
                                            <Typography variant="body2">
                                                {tx.receiver.name}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                {tx.receiver.email}
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            —
                                        </Typography>
                                    )}
                                </TableCell>
                                <TableCell align="right">
                                    <Typography
                                        variant="body2"
                                        fontWeight={600}
                                        color={isCredit ? 'success.main' : 'error.main'}
                                    >
                                        {isCredit ? '+' : '-'}
                                        {formatCurrency(tx.amount)}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <StatusChip status={tx.status} />
                                </TableCell>
                                <TableCell>
                                    <Typography variant="caption">
                                        {formatDate(tx.createdAt)}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
