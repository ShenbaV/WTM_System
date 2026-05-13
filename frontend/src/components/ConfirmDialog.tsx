import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    Typography,
} from '@mui/material';
import { ReactNode } from 'react';

interface Props {
    open: boolean;
    title: string;
    description?: ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    busy?: boolean;
    danger?: boolean;
    onClose: () => void;
    onConfirm: () => void;
    children?: ReactNode;
}

export default function ConfirmDialog({
    open,
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    busy,
    danger,
    onClose,
    onConfirm,
    children,
}: Props) {
    return (
        <Dialog
            open={open}
            onClose={busy ? undefined : onClose}
            fullWidth
            maxWidth="xs"
            PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
        >
            <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>{title}</DialogTitle>
            <DialogContent>
                <Stack spacing={2}>
                    {description && (
                        <Typography variant="body2" color="text.secondary">
                            {description}
                        </Typography>
                    )}
                    {children}
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} disabled={busy}>
                    {cancelLabel}
                </Button>
                <Button
                    variant="contained"
                    color={danger ? 'error' : 'primary'}
                    onClick={onConfirm}
                    disabled={busy}
                >
                    {busy ? 'Working…' : confirmLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
