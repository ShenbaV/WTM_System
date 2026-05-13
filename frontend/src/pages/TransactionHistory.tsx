import { useState } from 'react';
import { Box, Button, Stack, TablePagination, Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useQueryClient } from '@tanstack/react-query';
import TransactionsTable from '../components/TransactionsTable';
import { useTransactions } from '../hooks/useTransactions';

export default function TransactionHistory() {
    const qc = useQueryClient();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const { data, isLoading, isFetching } = useTransactions({
        limit: rowsPerPage,
        offset: page * rowsPerPage,
    });

    return (
        <Stack spacing={3}>
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={2}
            >
                <Box>
                    <Typography variant="h4" fontWeight={700}>
                        Transactions
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Every deposit and transfer involving your wallet.
                    </Typography>
                </Box>
                <Button
                    startIcon={<RefreshIcon />}
                    onClick={() => qc.invalidateQueries({ queryKey: ['transactions'] })}
                    disabled={isFetching}
                >
                    Refresh
                </Button>
            </Stack>

            <TransactionsTable
                items={data?.transactions}
                loading={isLoading}
            />

            {data && data.total > 0 && (
                <TablePagination
                    component="div"
                    count={data.total}
                    page={page}
                    onPageChange={(_, p) => setPage(p)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                />
            )}
        </Stack>
    );
}
