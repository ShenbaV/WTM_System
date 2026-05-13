import { useState } from 'react';
import { Box, Button, Link as MuiLink, Stack, TextField, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useLogin } from '../hooks/useAuth';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const { mutate, isPending } = useLogin();

    const validate = () => {
        const e: typeof errors = {};
        if (!email.trim()) e.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Invalid email';
        if (!password) e.password = 'Password is required';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        mutate({ email: email.trim(), password });
    };

    return (
        <Box>
            <Typography variant="h5" fontWeight={700} gutterBottom>
                Sign in
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Welcome back. Enter your details below.
            </Typography>
            <form onSubmit={onSubmit} noValidate>
                <Stack spacing={2}>
                    <TextField
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        error={Boolean(errors.email)}
                        helperText={errors.email}
                        autoComplete="email"
                        fullWidth
                    />
                    <TextField
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        error={Boolean(errors.password)}
                        helperText={errors.password}
                        autoComplete="current-password"
                        fullWidth
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={isPending}
                    >
                        {isPending ? 'Signing in…' : 'Sign in'}
                    </Button>
                </Stack>
            </form>
            <Typography variant="body2" sx={{ mt: 3, textAlign: 'center' }}>
                Don&apos;t have an account?{' '}
                <MuiLink component={RouterLink} to="/register">
                    Create one
                </MuiLink>
            </Typography>
        </Box>
    );
}
