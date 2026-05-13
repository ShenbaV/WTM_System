import { Box, Card, CardContent, Skeleton, Stack, Typography, alpha } from '@mui/material';
import { ReactNode } from 'react';

interface Props {
    label: string;
    value: ReactNode;
    icon: ReactNode;
    tint?: 'primary' | 'success' | 'error' | 'warning' | 'info';
    sub?: ReactNode;
    loading?: boolean;
}

const tintMap: Record<NonNullable<Props['tint']>, string> = {
    primary: '#5B5FE9',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#0EA5E9',
};

export default function StatCard({
    label,
    value,
    icon,
    tint = 'primary',
    sub,
    loading,
}: Props) {
    const color = tintMap[tint];
    return (
        <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                <Stack direction="row" alignItems="flex-start" spacing={2}>
                    <Box
                        sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 2,
                            bgcolor: alpha(color, 0.12),
                            color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                        }}
                    >
                        {icon}
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="overline" color="text.secondary">
                            {label}
                        </Typography>
                        {loading ? (
                            <Skeleton variant="text" width="60%" height={32} />
                        ) : (
                            <Typography
                                variant="h5"
                                fontWeight={700}
                                noWrap
                                sx={{ mt: 0.25 }}
                            >
                                {value}
                            </Typography>
                        )}
                        {sub && !loading && (
                            <Typography variant="caption" color="text.secondary">
                                {sub}
                            </Typography>
                        )}
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
}
