import { useState } from 'react';
import {
    AppBar,
    Avatar,
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
    Toolbar,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddCardIcon from '@mui/icons-material/AddCard';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import LogoutIcon from '@mui/icons-material/Logout';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { authStore } from '../store/auth';
import { useLogout } from '../hooks/useAuth';

const DRAWER_WIDTH = 240;

const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { to: '/add-money', label: 'Add Money', icon: <AddCardIcon /> },
    { to: '/transfer', label: 'Transfer', icon: <SwapHorizIcon /> },
    { to: '/transactions', label: 'Transactions', icon: <ReceiptLongIcon /> },
];

export default function AppLayout() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileOpen, setMobileOpen] = useState(false);
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
    const logout = useLogout();
    const navigate = useNavigate();
    const user = authStore.getUser();

    const handleNav = () => {
        if (isMobile) setMobileOpen(false);
    };

    const drawer = (
        <Box sx={{ width: DRAWER_WIDTH }} role="navigation">
            <Toolbar sx={{ px: 2 }}>
                <Typography variant="h6" fontWeight={700} color="primary">
                    Wallet
                </Typography>
            </Toolbar>
            <Divider />
            <List>
                {navItems.map((item) => (
                    <ListItemButton
                        key={item.to}
                        component={NavLink}
                        to={item.to}
                        onClick={handleNav}
                        sx={{
                            '&.active': {
                                bgcolor: 'action.selected',
                                color: 'primary.main',
                                '& .MuiListItemIcon-root': { color: 'primary.main' },
                            },
                        }}
                    >
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.label} />
                    </ListItemButton>
                ))}
            </List>
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
                }}
            >
                <Toolbar>
                    <IconButton
                        edge="start"
                        onClick={() => setMobileOpen((o) => !o)}
                        sx={{ mr: 2, display: { md: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Box sx={{ flexGrow: 1 }} />
                    <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                            {(user?.name?.[0] ?? '?').toUpperCase()}
                        </Avatar>
                    </IconButton>
                    <Menu
                        anchorEl={menuAnchor}
                        open={Boolean(menuAnchor)}
                        onClose={() => setMenuAnchor(null)}
                    >
                        <MenuItem disabled>
                            <Box>
                                <Typography variant="body2" fontWeight={600}>
                                    {user?.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {user?.email}
                                </Typography>
                            </Box>
                        </MenuItem>
                        <Divider />
                        <MenuItem
                            onClick={() => {
                                setMenuAnchor(null);
                                navigate('/dashboard');
                            }}
                        >
                            <DashboardIcon fontSize="small" sx={{ mr: 1.5 }} /> Dashboard
                        </MenuItem>
                        <MenuItem
                            onClick={() => {
                                setMenuAnchor(null);
                                logout();
                            }}
                        >
                            <LogoutIcon fontSize="small" sx={{ mr: 1.5 }} /> Logout
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
                        '& .MuiDrawer-paper': { width: DRAWER_WIDTH },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    open
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
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
                    pt: { xs: 9, md: 10 },
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
