import { Box, Button, Grid, Stack, Typography } from '@mui/material';
import AddCardIcon from '@mui/icons-material/AddCard';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { Link as RouterLink } from 'react-router-dom';
import BalanceCard from '../components/BalanceCard';
import TransactionsTable from '../components/TransactionsTable';
import { useWallet } from '../hooks/useWallet';
import { useTransactions } from '../hooks/useTransactions';
import { authStore } from '../store/auth';

export default function Dashboard() {
    const user = authStore.getUser();
    const { data: wallet, isLoading: walletLoading } = useWallet();
    const { data: txs, isLoading: txLoading } = useTransactions({ limit: 5, offset: 0 });

    return (
        <Stack spacing={3}>
            <Box>
                <Typography variant="h4" fontWeight={700}>
                    Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Here&apos;s a snapshot of your wallet.
                </Typography>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={7}>
                    <BalanceCard
                        balance={wallet?.balance}
                        loading={walletLoading}
                        name={user?.email}
                    />
                </Grid>
                <Grid item xs={12} md={5}>
                    <Stack spacing={2}>
                        <Typography variant="overline" color="text.secondary">
                            Quick actions
                        </Typography>
                        <Button
                            component={RouterLink}
                            to="/add-money"
                            variant="contained"
                            size="large"
                            startIcon={<AddCardIcon />}
                        >
                            Add money
                        </Button>
                        <Button
                            component={RouterLink}
                            to="/transfer"
                            variant="outlined"
                            size="large"
                            startIcon={<SwapHorizIcon />}
                        >
                            Transfer
                        </Button>
                        <Button
                            component={RouterLink}
                            to="/transactions"
                            variant="text"
                            size="large"
                            startIcon={<ReceiptLongIcon />}
                        >
                            View all transactions
                        </Button>
                    </Stack>
                </Grid>
            </Grid>

            <Box>
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 2 }}
                >
                    <Typography variant="h6" fontWeight={700}>
                        Recent transactions
                    </Typography>
                    <Button component={RouterLink} to="/transactions" size="small">
                        See all
                    </Button>
                </Stack>
                <TransactionsTable
                    items={txs?.transactions}
                    loading={txLoading}
                    empty="No transactions yet — add money or transfer to get started."
                />
            </Box>
        </Stack>
    );
}
