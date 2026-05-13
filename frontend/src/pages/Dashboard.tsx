import { useMemo } from 'react';
import { Box, Button, Card, CardActionArea, Grid, Stack, Typography } from '@mui/material';
import AddCardIcon from '@mui/icons-material/AddCardRounded';
import SwapHorizIcon from '@mui/icons-material/SwapHorizRounded';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLongRounded';
import TrendingUpIcon from '@mui/icons-material/TrendingUpRounded';
import TrendingDownIcon from '@mui/icons-material/TrendingDownRounded';
import SyncAltIcon from '@mui/icons-material/SyncAltRounded';
import { Link as RouterLink } from 'react-router-dom';
import BalanceCard from '../components/BalanceCard';
import StatCard from '../components/StatCard';
import TransactionsTable from '../components/TransactionsTable';
import { useWallet } from '../hooks/useWallet';
import { useTransactions } from '../hooks/useTransactions';
import { authStore } from '../store/auth';
import { formatCurrency } from '../utils/format';

function greeting(name?: string) {
    const h = new Date().getHours();
    const tod = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
    return name ? `${tod}, ${name.split(' ')[0]}` : tod;
}

interface QuickAction {
    to: string;
    label: string;
    description: string;
    icon: React.ReactNode;
    tint: string;
}

function QuickActionCard({ action }: { action: QuickAction }) {
    return (
        <Card>
            <CardActionArea component={RouterLink} to={action.to} sx={{ p: 2.5, borderRadius: 4 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                        sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 2,
                            bgcolor: `${action.tint}1F`,
                            color: action.tint,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {action.icon}
                    </Box>
                    <Box>
                        <Typography variant="subtitle1" fontWeight={700}>
                            {action.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {action.description}
                        </Typography>
                    </Box>
                </Stack>
            </CardActionArea>
        </Card>
    );
}

const quickActions: QuickAction[] = [
    {
        to: '/add-money',
        label: 'Add money',
        description: 'Top up your wallet',
        icon: <AddCardIcon />,
        tint: '#10B981',
    },
    {
        to: '/transfer',
        label: 'Transfer',
        description: 'Send to another user',
        icon: <SwapHorizIcon />,
        tint: '#5B5FE9',
    },
    {
        to: '/transactions',
        label: 'History',
        description: 'See all transactions',
        icon: <ReceiptLongIcon />,
        tint: '#0EA5E9',
    },
];

export default function Dashboard() {
    const user = authStore.getUser();
    const { data: wallet, isLoading: walletLoading } = useWallet();
    const { data: tx, isLoading: txLoading } = useTransactions({ limit: 100, offset: 0 });

    const stats = useMemo(() => {
        const items = tx?.transactions ?? [];
        let received = 0;
        let sent = 0;
        let transfers = 0;
        for (const t of items) {
            if (t.status !== 'SUCCESS') continue;
            if (t.direction === 'CREDIT') received += t.amount;
            else if (t.direction === 'DEBIT') sent += t.amount;
            if (t.type === 'TRANSFER') transfers++;
        }
        return { received, sent, transfers, total: tx?.total ?? items.length };
    }, [tx]);

    const recent = useMemo(() => (tx?.transactions ?? []).slice(0, 5), [tx]);

    return (
        <Stack spacing={3}>
            <Box>
                <Typography variant="h4" fontWeight={800}>
                    {greeting(user?.name)}
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
                        name={user?.name}
                        email={user?.email}
                    />
                </Grid>
                <Grid item xs={12} md={5}>
                    <Stack spacing={2}>
                        {quickActions.map((a) => (
                            <QuickActionCard key={a.to} action={a} />
                        ))}
                    </Stack>
                </Grid>
            </Grid>

            <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                    <StatCard
                        label="Total received"
                        value={formatCurrency(stats.received)}
                        icon={<TrendingUpIcon />}
                        tint="success"
                        loading={txLoading}
                        sub={`${recent.filter((r) => r.direction === 'CREDIT').length} recent credit(s)`}
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <StatCard
                        label="Total sent"
                        value={formatCurrency(stats.sent)}
                        icon={<TrendingDownIcon />}
                        tint="error"
                        loading={txLoading}
                        sub={`${recent.filter((r) => r.direction === 'DEBIT').length} recent debit(s)`}
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <StatCard
                        label="Transfers"
                        value={stats.transfers}
                        icon={<SyncAltIcon />}
                        tint="primary"
                        loading={txLoading}
                        sub={`${stats.total} total transaction(s)`}
                    />
                </Grid>
            </Grid>

            <Box>
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 1.5 }}
                >
                    <Typography variant="h6" fontWeight={800}>
                        Recent activity
                    </Typography>
                    <Button component={RouterLink} to="/transactions" size="small">
                        See all
                    </Button>
                </Stack>
                <TransactionsTable
                    items={recent}
                    loading={txLoading}
                    emptyTitle="No activity yet"
                    emptyDescription="Add money to your wallet or send a transfer to see it here."
                    emptyActionHref="/add-money"
                    emptyActionLabel="Add money"
                />
            </Box>
        </Stack>
    );
}
