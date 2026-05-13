import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
    palette: {
        mode: 'light',
        primary: { main: '#3f51b5' },
        secondary: { main: '#009688' },
        background: { default: '#f5f6fa', paper: '#ffffff' },
    },
    shape: { borderRadius: 10 },
    typography: {
        fontFamily:
            '"Inter", "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
        h4: { fontWeight: 700 },
        h5: { fontWeight: 700 },
        button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
        MuiButton: {
            defaultProps: { disableElevation: true },
        },
        MuiPaper: {
            styleOverrides: {
                rounded: { borderRadius: 12 },
            },
        },
    },
});
