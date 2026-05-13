import { useState } from 'react';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { useLogin } from '../hooks/useAuth';
import PasswordField from '../components/PasswordField';
import { extractErrorMessage } from '../services/api';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const { mutate, isPending, error, reset } = useLogin();

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
        reset();
        if (!validate()) return;
        mutate({ email: email.trim(), password });
    };

    return (
        <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Welcome back — sign in to access your wallet.
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={reset}>
                    {extractErrorMessage(error, 'Sign in failed')}
                </Alert>
            )}

            <form onSubmit={onSubmit} noValidate>
                <Stack spacing={2}>
                    <TextField
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
                        }}
                        error={Boolean(errors.email)}
                        helperText={errors.email}
                        autoComplete="email"
                        autoFocus
                        fullWidth
                    />
                    <PasswordField
                        label="Password"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                        }}
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
                        startIcon={
                            isPending ? <CircularProgress size={18} color="inherit" /> : undefined
                        }
                    >
                        {isPending ? 'Signing in…' : 'Sign in'}
                    </Button>
                </Stack>
            </form>

        </Box>
    );
}
