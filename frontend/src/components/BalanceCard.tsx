import {
    Box,
    Card,
    CardContent,
    IconButton,
    Skeleton,
    Stack,
    Tooltip,
    Typography,
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useState } from 'react';
import { formatCurrency } from '../utils/format';
import { gradients } from '../theme';

interface Props {
    balance?: number;
    loading?: boolean;
    name?: string;
    email?: string;
}

export default function BalanceCard({ balance, loading, name, email }: Props) {
    const [hidden, setHidden] = useState(false);

    return (
        <Card
            sx={{
                position: 'relative',
                overflow: 'hidden',
                border: 0,
                color: 'common.white',
                background: gradients.hero,
                boxShadow: '0 18px 40px rgba(91, 95, 233, 0.28)',
            }}
        >
            {/* Decorative blobs */}
            <Box
                aria-hidden
                sx={{
                    position: 'absolute',
                    width: 240,
                    height: 240,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.12)',
                    top: -80,
                    right: -80,
                }}
            />
            <Box
                aria-hidden
                sx={{
                    position: 'absolute',
                    width: 160,
                    height: 160,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.08)',
                    bottom: -60,
                    left: -40,
                }}
            />
            <CardContent
                sx={{
                    position: 'relative',
                    p: { xs: 3, md: 4 },
                    minHeight: 200,
                }}
            >
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    spacing={2}
                >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 2,
                                bgcolor: 'rgba(255,255,255,0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <AccountBalanceWalletIcon fontSize="small" />
                        </Box>
                        <Box>
                            <Typography variant="overline" sx={{ opacity: 0.8, color: 'inherit' }}>
                                Available balance
                            </Typography>
                            {name && (
                                <Typography variant="body2" sx={{ opacity: 0.95, mt: -0.25 }}>
                                    {name}
                                </Typography>
                            )}
                        </Box>
                    </Stack>
                    <Tooltip title={hidden ? 'Show balance' : 'Hide balance'}>
                        <IconButton
                            size="small"
                            onClick={() => setHidden((h) => !h)}
                            sx={{ color: 'rgba(255,255,255,0.85)' }}
                        >
                            {hidden ? <VisibilityIcon /> : <VisibilityOffIcon />}
                        </IconButton>
                    </Tooltip>
                </Stack>

                <Box sx={{ mt: 3 }}>
                    {loading ? (
                        <Skeleton
                            variant="text"
                            width={260}
                            height={60}
                            sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}
                        />
                    ) : (
                        <Typography
                            variant="h3"
                            fontWeight={800}
                            sx={{ letterSpacing: '-0.02em' }}
                        >
                            {hidden ? '••••••' : formatCurrency(balance ?? 0)}
                        </Typography>
                    )}
                    {email && (
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                            {email}
                        </Typography>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
}
