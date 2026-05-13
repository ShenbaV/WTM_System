import { IconButton, InputAdornment, TextField, TextFieldProps } from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import { useState } from 'react';

export default function PasswordField(props: Omit<TextFieldProps, 'type'>) {
    const [show, setShow] = useState(false);
    return (
        <TextField
            {...props}
            type={show ? 'text' : 'password'}
            InputProps={{
                ...props.InputProps,
                endAdornment: (
                    <InputAdornment position="end">
                        <IconButton
                            onClick={() => setShow((s) => !s)}
                            edge="end"
                            size="small"
                            aria-label={show ? 'Hide password' : 'Show password'}
                        >
                            {show ? (
                                <VisibilityOffOutlinedIcon fontSize="small" />
                            ) : (
                                <VisibilityOutlinedIcon fontSize="small" />
                            )}
                        </IconButton>
                    </InputAdornment>
                ),
            }}
        />
    );
}
