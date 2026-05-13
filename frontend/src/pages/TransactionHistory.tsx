import { useMemo, useState } from 'react';
import {
    Box,
    Button,
    Paper,
    Stack,
    Tab,
    TablePagination,
    Tabs,
    Typography,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/RefreshRounded';
import { useQueryClient } from '@tanstack/react-query';
import TransactionsTable from '../components/TransactionsTable';
import { useTransactions } from '../hooks/useTransactions';
import { Transaction } from '../types';

type Filter = 'ALL' | 'CREDIT' | 'DEBIT' | 'DEPOSIT';

function applyFilter(items: Transaction[], filter: Filter): Transaction[] {
    if (filter === 'ALL') return items;
    if (filter === 'DEPOSIT') return items.filter((t) => t.type === 'DEPOSIT');
    return items.filter((t) => t.type === 'TRANSFER' && t.direction === filter);
}

export default function TransactionHistory() {
    const qc = useQueryClient();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filter, setFilter] = useState<Filter>('ALL');

    const { data, isLoading, isFetching } = useTransactions({
        limit: rowsPerPage,
        offset: page * rowsPerPage,
    });

    const filtered = useMemo(
        () => applyFilter(data?.transactions ?? [], filter),
        [data, filter]
    );

    const total = data?.total ?? 0;
    const showingClientFilter = filter !== 'ALL';

    return (
        <Stack spacing={3}>
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={2}
            >
                <Box>
                    <Typography variant="h4" fontWeight={800}>
                        Transactions
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Every deposit and transfer involving your wallet.
                    </Typography>
                </Box>
                <Button
                    startIcon={<RefreshIcon />}
                    onClick={() =>
                        qc.invalidateQueries({ queryKey: ['transactions'] })
                    }
                    disabled={isFetching}
                    variant="outlined"
                >
                    Refresh
                </Button>
            </Stack>

            <Paper variant="outlined" sx={{ px: 1, pt: 1 }}>
                <Tabs
                    value={filter}
                    onChange={(_, v: Filter) => setFilter(v)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 } }}
                >
                    <Tab value="ALL" label="All" />
                    <Tab value="CREDIT" label="Received" />
                    <Tab value="DEBIT" label="Sent" />
                    <Tab value="DEPOSIT" label="Top-ups" />
                </Tabs>
            </Paper>

            {showingClientFilter && filtered.length === 0 && !isLoading && (
                <Paper
                    variant="outlined"
                    sx={{ p: 3, textAlign: 'center', borderStyle: 'dashed' }}
                >
                    <Typography variant="body2" color="text.secondary">
                        No transactions match this filter on the current page.
                    </Typography>
                </Paper>
            )}

            <TransactionsTable
                items={filtered}
                loading={isLoading}
                emptyTitle="No transactions yet"
                emptyDescription="Add money to your wallet or send a transfer to get started."
                emptyActionHref="/add-money"
                emptyActionLabel="Add money"
            />

            {total > 0 && (
                <Paper variant="outlined">
                    <TablePagination
                        component="div"
                        count={total}
                        page={page}
                        onPageChange={(_, p) => setPage(p)}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={(e) => {
                            setRowsPerPage(parseInt(e.target.value, 10));
                            setPage(0);
                        }}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                    />
                </Paper>
            )}
        </Stack>
    );
}
