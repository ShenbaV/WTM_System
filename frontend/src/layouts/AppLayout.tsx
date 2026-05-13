import { useState } from 'react';
import {
    AppBar,
    Box,
    Container,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Stack,
    Toolbar,
    Typography,
    useMediaQuery,
    useTheme,
    alpha,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/DashboardRounded';
import AddCardIcon from '@mui/icons-material/AddCardRounded';
import SwapHorizIcon from '@mui/icons-material/SwapHorizRounded';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLongRounded';
import LogoutIcon from '@mui/icons-material/LogoutRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import { NavLink, Outlet } from 'react-router-dom';
import { authStore } from '../store/auth';
import { useLogout } from '../hooks/useAuth';
import UserAvatar from '../components/UserAvatar';

const DRAWER_WIDTH = 248;

const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { to: '/add-money', label: 'Add money', icon: <AddCardIcon /> },
    { to: '/transfer', label: 'Transfer', icon: <SwapHorizIcon /> },
    { to: '/transactions', label: 'Transactions', icon: <ReceiptLongIcon /> },
];

function Brand() {
    return (
        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ py: 2.5, px: 2.5 }}>
            <Box
                sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    background:
                        'linear-gradient(135deg,#5B5FE9 0%,#7C5BE9 60%,#10B981 130%)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 6px 14px rgba(91,95,233,0.35)',
                }}
            >
                <AccountBalanceWalletRoundedIcon fontSize="small" />
            </Box>
            <Box>
                <Typography variant="subtitle1" fontWeight={800} sx={{ lineHeight: 1 }}>
                    Wallet
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    Manage your money
                </Typography>
            </Box>
        </Stack>
    );
}

export default function AppLayout() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileOpen, setMobileOpen] = useState(false);
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
    const logout = useLogout();
    const user = authStore.getUser();

    const handleNav = () => {
        if (isMobile) setMobileOpen(false);
    };

    const drawer = (
        <Box sx={{ width: DRAWER_WIDTH, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Brand />
            <Divider />
            <List sx={{ p: 1.5, flex: 1 }}>
                {navItems.map((item) => (
                    <ListItemButton
                        key={item.to}
                        component={NavLink}
                        to={item.to}
                        onClick={handleNav}
                        sx={{
                            borderRadius: 2,
                            mb: 0.5,
                            px: 1.5,
                            py: 1.1,
                            color: 'text.secondary',
                            '& .MuiListItemIcon-root': {
                                minWidth: 36,
                                color: 'text.secondary',
                            },
                            '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.06),
                            },
                            '&.active': {
                                bgcolor: alpha(theme.palette.primary.main, 0.12),
                                color: 'primary.main',
                                fontWeight: 700,
                                '& .MuiListItemIcon-root': { color: 'primary.main' },
                                '& .MuiListItemText-primary': { fontWeight: 700 },
                            },
                        }}
                    >
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText
                            primary={item.label}
                            primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }}
                        />
                    </ListItemButton>
                ))}
            </List>
            <Divider />
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ p: 2 }}>
                <UserAvatar name={user?.name} email={user?.email} size={36} />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="body2" fontWeight={700} noWrap>
                        {user?.name ?? 'Guest'}
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
                        {user?.email}
                    </Typography>
                </Box>
                <IconButton size="small" onClick={logout} aria-label="Sign out">
                    <LogoutIcon fontSize="small" />
                </IconButton>
            </Stack>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
            <AppBar
                position="fixed"
                color="inherit"
                elevation={0}
                sx={{
                    borderBottom: 1,
                    borderColor: 'divider',
                    width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
                    ml: { md: `${DRAWER_WIDTH}px` },
                    bgcolor: 'rgba(255,255,255,0.85)',
                    backdropFilter: 'blur(10px)',
                }}
            >
                <Toolbar sx={{ minHeight: 64 }}>
                    <IconButton
                        edge="start"
                        onClick={() => setMobileOpen((o) => !o)}
                        sx={{ mr: 1.5, display: { md: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Box sx={{ flexGrow: 1 }} />
                    <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)} sx={{ p: 0.5 }}>
                        <UserAvatar name={user?.name} email={user?.email} size={36} />
                    </IconButton>
                    <Menu
                        anchorEl={menuAnchor}
                        open={Boolean(menuAnchor)}
                        onClose={() => setMenuAnchor(null)}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                        PaperProps={{ sx: { mt: 1, minWidth: 240, borderRadius: 2 } }}
                    >
                        <Box sx={{ px: 2, py: 1.5 }}>
                            <Typography variant="body2" fontWeight={700}>
                                {user?.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {user?.email}
                            </Typography>
                        </Box>
                        <Divider />
                        <MenuItem
                            onClick={() => {
                                setMenuAnchor(null);
                                logout();
                            }}
                            sx={{ color: 'error.main' }}
                        >
                            <LogoutIcon fontSize="small" sx={{ mr: 1.5 }} /> Sign out
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>

            <Box
                component="nav"
                sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={() => setMobileOpen(false)}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': {
                            width: DRAWER_WIDTH,
                            borderRight: 1,
                            borderColor: 'divider',
                        },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    open
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        '& .MuiDrawer-paper': {
                            width: DRAWER_WIDTH,
                            boxSizing: 'border-box',
                            borderRight: 1,
                            borderColor: 'divider',
                            bgcolor: 'background.paper',
                        },
                    }}
                >
                    {drawer}
                </Drawer>
            </Box>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
                    pt: { xs: 10, md: 11 },
                    pb: 6,
                }}
            >
                <Container maxWidth="lg">
                    <Outlet />
                </Container>
            </Box>
        </Box>
    );
}
