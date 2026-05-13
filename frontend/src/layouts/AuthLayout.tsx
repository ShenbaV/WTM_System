import {
    Box,
    ButtonBase,
    Container,
    Paper,
    Stack,
    Typography,
} from '@mui/material';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

type AuthTab = 'login' | 'register';

function SegmentedToggle({
    value,
    onChange,
}: {
    value: AuthTab;
    onChange: (v: AuthTab) => void;
}) {
    const isLogin = value === 'login';
    return (
        <Box
            role="tablist"
            sx={{
                position: 'relative',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                p: 0.5,
                borderRadius: 999,
                bgcolor: 'rgba(15,23,42,0.06)',
                width: '100%',
            }}
        >
            {/* Sliding indicator */}
            <Box
                aria-hidden
                sx={{
                    position: 'absolute',
                    top: 4,
                    bottom: 4,
                    left: 4,
                    width: 'calc(50% - 4px)',
                    bgcolor: 'background.paper',
                    borderRadius: 999,
                    boxShadow: '0 4px 12px rgba(15,23,42,0.10)',
                    transform: isLogin ? 'translateX(0)' : 'translateX(100%)',
                    transition: 'transform 240ms cubic-bezier(0.4, 0, 0.2, 1)',
                }}
            />
            {(['login', 'register'] as AuthTab[]).map((key) => {
                const active = value === key;
                return (
                    <ButtonBase
                        key={key}
                        role="tab"
                        aria-selected={active}
                        onClick={() => onChange(key)}
                        sx={{
                            position: 'relative',
                            zIndex: 1,
                            py: 1.25,
                            borderRadius: 999,
                            fontWeight: 700,
                            fontSize: 14,
                            color: active ? 'primary.main' : 'text.secondary',
                            transition: 'color 200ms ease',
                            '&:hover': { color: active ? 'primary.main' : 'text.primary' },
                        }}
                    >
                        {key === 'login' ? 'Sign in' : 'Sign up'}
                    </ButtonBase>
                );
            })}
        </Box>
    );
}

export default function AuthLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const current: AuthTab = location.pathname.startsWith('/register')
        ? 'register'
        : 'login';

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 2,
                py: { xs: 4, md: 6 },
                position: 'relative',
                overflow: 'hidden',
                background:
                    'radial-gradient(1200px 600px at -10% -10%, #6366F1 0%, transparent 55%),' +
                    'radial-gradient(900px 600px at 110% 110%, #10B981 0%, transparent 55%),' +
                    'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #06B6D4 100%)',
            }}
        >
            {/* Soft noise / shimmer layer */}
            <Box
                aria-hidden
                sx={{
                    position: 'absolute',
                    inset: 0,
                    background:
                        'radial-gradient(600px 300px at 50% 110%, rgba(255,255,255,0.18), transparent 70%)',
                    pointerEvents: 'none',
                }}
            />

            <Container maxWidth="xs" sx={{ position: 'relative' }}>
                <Stack spacing={3} alignItems="center">
                    {/* Floating brand */}
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box
                            sx={{
                                width: 48,
                                height: 48,
                                borderRadius: 2.5,
                                bgcolor: 'rgba(255,255,255,0.18)',
                                backdropFilter: 'blur(8px)',
                                color: '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid rgba(255,255,255,0.3)',
                            }}
                        >
                            <AccountBalanceWalletRoundedIcon />
                        </Box>
                        <Box sx={{ color: 'common.white' }}>
                            <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1 }}>
                                Wallet
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.85 }}>
                                Your money, simply managed
                            </Typography>
                        </Box>
                    </Stack>

                    {/* Auth card */}
                    <Paper
                        elevation={0}
                        sx={{
                            width: '100%',
                            borderRadius: 3,
                            p: { xs: 3, sm: 4 },
                            backgroundColor: 'rgba(255,255,255,0.98)',
                            border: '1px solid rgba(255,255,255,0.6)',
                            boxShadow:
                                '0 30px 60px -20px rgba(15,23,42,0.35), 0 18px 36px -18px rgba(15,23,42,0.20)',
                        }}
                    >
                        <Stack spacing={3}>
                            <SegmentedToggle
                                value={current}
                                onChange={(v) =>
                                    navigate(`/${v}`, { replace: true })
                                }
                            />
                            <Box>
                                <Outlet />
                            </Box>
                        </Stack>
                    </Paper>     
                </Stack>
            </Container>
        </Box>
    );
}
