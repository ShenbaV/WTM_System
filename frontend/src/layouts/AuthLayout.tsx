import { Box, Container, Paper, Typography } from '@mui/material';
import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                background:
                    'linear-gradient(135deg, rgba(63,81,181,0.08) 0%, rgba(0,150,136,0.08) 100%)',
            }}
        >
            <Container maxWidth="sm">
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Typography variant="h4" fontWeight={700} color="primary">
                        Wallet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Secure wallet & transaction management
                    </Typography>
                </Box>
                <Paper elevation={3} sx={{ p: { xs: 3, sm: 4 }, borderRadius: 3 }}>
                    <Outlet />
                </Paper>
            </Container>
        </Box>
    );
}
