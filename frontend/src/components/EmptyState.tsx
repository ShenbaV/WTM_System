import { Box, Button, Paper, Stack, Typography, alpha } from '@mui/material';
import { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';

interface Props {
    icon: ReactNode;
    title: string;
    description?: string;
    actionLabel?: string;
    actionHref?: string;
    tint?: string;
}

export default function EmptyState({
    icon,
    title,
    description,
    actionLabel,
    actionHref,
    tint = '#5B5FE9',
}: Props) {
    return (
        <Paper variant="outlined" sx={{ p: { xs: 4, md: 6 }, textAlign: 'center' }}>
            <Stack spacing={2} alignItems="center">
                <Box
                    sx={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        bgcolor: alpha(tint, 0.12),
                        color: tint,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {icon}
                </Box>
                <Box>
                    <Typography variant="h6" fontWeight={700}>
                        {title}
                    </Typography>
                    {description && (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 0.5, maxWidth: 420 }}
                        >
                            {description}
                        </Typography>
                    )}
                </Box>
                {actionLabel && actionHref && (
                    <Button
                        component={RouterLink}
                        to={actionHref}
                        variant="contained"
                        sx={{ mt: 1 }}
                    >
                        {actionLabel}
                    </Button>
                )}
            </Stack>
        </Paper>
    );
}
