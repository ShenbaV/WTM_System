import { useState } from 'react';
import { Box, Button, Link as MuiLink, Stack, TextField, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useRegister } from '../hooks/useAuth';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
    const { mutate, isPending } = useRegister();

    const validate = () => {
        const e: typeof errors = {};
        if (!name.trim() || name.trim().length < 2) e.name = 'Enter your full name';
        if (!email.trim()) e.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Invalid email';
        if (!password || password.length < 8) e.password = 'Min 8 characters';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        mutate({ name: name.trim(), email: email.trim(), password });
    };

    return (
        <Box>
            <Typography variant="h5" fontWeight={700} gutterBottom>
                Create your account
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                A wallet is created automatically when you register.
            </Typography>
            <form onSubmit={onSubmit} noValidate>
                <Stack spacing={2}>
                    <TextField
                        label="Full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        error={Boolean(errors.name)}
                        helperText={errors.name}
                        autoComplete="name"
                        fullWidth
                    />
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
                        helperText={errors.password ?? 'At least 8 characters'}
                        autoComplete="new-password"
                        fullWidth
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={isPending}
                    >
                        {isPending ? 'Creating account…' : 'Create account'}
                    </Button>
                </Stack>
            </form>
            <Typography variant="body2" sx={{ mt: 3, textAlign: 'center' }}>
                Already have an account?{' '}
                <MuiLink component={RouterLink} to="/login">
                    Sign in
                </MuiLink>
            </Typography>
        </Box>
    );
}
