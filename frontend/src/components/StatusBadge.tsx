import { Chip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { TransactionStatus } from '../types';

interface Props {
    status: TransactionStatus;
    size?: 'small' | 'medium';
}

const config: Record<
    TransactionStatus,
    {
        color: 'success' | 'error' | 'warning';
        label: string;
        icon: React.ReactElement;
    }
> = {
    SUCCESS: { color: 'success', label: 'Success', icon: <CheckCircleIcon /> },
    FAILED: { color: 'error', label: 'Failed', icon: <ErrorIcon /> },
    PENDING: { color: 'warning', label: 'Pending', icon: <AccessTimeIcon /> },
};

export default function StatusBadge({ status, size = 'small' }: Props) {
    const c = config[status];
    return (
        <Chip
            size={size}
            color={c.color}
            label={c.label}
            icon={c.icon}
            variant="outlined"
            sx={{
                fontWeight: 600,
                '& .MuiChip-icon': { fontSize: 14 },
            }}
        />
    );
}
