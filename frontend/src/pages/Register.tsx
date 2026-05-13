import { useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    LinearProgress,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { useRegister } from '../hooks/useAuth';
import PasswordField from '../components/PasswordField';
import { extractErrorMessage } from '../services/api';

function passwordStrength(pw: string): { score: number; label: string; color: 'error' | 'warning' | 'success' } {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (pw.length >= 12) score++;
    const pct = (score / 5) * 100;
    if (score <= 2) return { score: pct, label: 'Weak', color: 'error' };
    if (score <= 3) return { score: pct, label: 'Okay', color: 'warning' };
    return { score: pct, label: 'Strong', color: 'success' };
}

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
    const { mutate, isPending, error, reset } = useRegister();

    const strength = useMemo(() => passwordStrength(password), [password]);

    const validate = () => {
        const e: typeof errors = {};
        if (!name.trim() || name.trim().length < 2) e.name = 'Enter your full name';
        if (!email.trim()) e.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Invalid email';
        if (!password) e.password = 'Password is required';
        else if (password.length < 8) e.password = 'Min 8 characters';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        reset();
        if (!validate()) return;
        mutate({ name: name.trim(), email: email.trim(), password });
    };

    return (
        <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Create your account — we&apos;ll set up your wallet automatically.
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={reset}>
                    {extractErrorMessage(error, 'Registration failed')}
                </Alert>
            )}

            <form onSubmit={onSubmit} noValidate>
                <Stack spacing={2}>
                    <TextField
                        label="Full name"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
                        }}
                        error={Boolean(errors.name)}
                        helperText={errors.name}
                        autoComplete="name"
                        autoFocus
                        fullWidth
                    />
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
                        fullWidth
                    />
                    <Box>
                        <PasswordField
                            label="Password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                            }}
                            error={Boolean(errors.password)}
                            helperText={errors.password ?? 'Use at least 8 characters.'}
                            autoComplete="new-password"
                            fullWidth
                        />
                        {password && (
                            <Box sx={{ mt: 1 }}>
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="caption" color="text.secondary">
                                        Password strength
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        color={`${strength.color}.main`}
                                        fontWeight={600}
                                    >
                                        {strength.label}
                                    </Typography>
                                </Stack>
                                <LinearProgress
                                    variant="determinate"
                                    value={strength.score}
                                    color={strength.color}
                                    sx={{ mt: 0.5, height: 6, borderRadius: 3 }}
                                />
                            </Box>
                        )}
                    </Box>
                    <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={isPending}
                        startIcon={
                            isPending ? <CircularProgress size={18} color="inherit" /> : undefined
                        }
                    >
                        {isPending ? 'Creating account…' : 'Create account'}
                    </Button>
                </Stack>
            </form>

        </Box>
    );
}
