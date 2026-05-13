import { Box, Card, CardContent, Skeleton, Stack, Typography } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { formatCurrency } from '../utils/format';

interface Props {
    balance?: number;
    loading?: boolean;
    name?: string;
}

export default function BalanceCard({ balance, loading, name }: Props) {
    return (
        <Card
            sx={{
                background: 'linear-gradient(135deg, #3f51b5 0%, #5c6bc0 60%, #009688 120%)',
                color: 'common.white',
                borderRadius: 3,
            }}
            elevation={4}
        >
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box>
                        <Typography variant="overline" sx={{ opacity: 0.8 }}>
                            Available balance
                        </Typography>
                        {loading ? (
                            <Skeleton
                                variant="text"
                                width={220}
                                height={56}
                                sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}
                            />
                        ) : (
                            <Typography variant="h3" fontWeight={700}>
                                {formatCurrency(balance ?? 0)}
                            </Typography>
                        )}
                        {name && (
                            <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
                                {name}
                            </Typography>
                        )}
                    </Box>
                    <AccountBalanceWalletIcon sx={{ fontSize: 64, opacity: 0.3 }} />
                </Stack>
            </CardContent>
        </Card>
    );
}
