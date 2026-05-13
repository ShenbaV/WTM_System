import { createTheme, alpha } from '@mui/material/styles';

const indigo = '#5B5FE9';
const indigoDark = '#3F44C9';
const teal = '#10B981';
const danger = '#EF4444';
const warning = '#F59E0B';
const slate900 = '#0F172A';
const slate700 = '#334155';
const slate500 = '#64748B';
const slate200 = '#E2E8F0';
const surface = '#FFFFFF';
const bg = '#F6F7FB';

export const theme = createTheme({
    palette: {
        mode: 'light',
        primary: { main: indigo, dark: indigoDark, light: '#8487F0', contrastText: '#fff' },
        secondary: { main: teal, contrastText: '#fff' },
        success: { main: teal },
        error: { main: danger },
        warning: { main: warning },
        background: { default: bg, paper: surface },
        text: { primary: slate900, secondary: slate500 },
        divider: slate200,
    },
    shape: { borderRadius: 14 },
    typography: {
        fontFamily:
            '"Inter", "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
        fontSize: 14,
        h3: { fontWeight: 700, letterSpacing: '-0.02em' },
        h4: { fontWeight: 700, letterSpacing: '-0.02em' },
        h5: { fontWeight: 700, letterSpacing: '-0.01em' },
        h6: { fontWeight: 700 },
        subtitle2: { fontWeight: 600, color: slate700 },
        button: { textTransform: 'none', fontWeight: 600, letterSpacing: 0 },
        overline: { fontWeight: 600, letterSpacing: '0.08em', color: slate500 },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    backgroundColor: bg,
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                },
                '*::-webkit-scrollbar': { width: 8, height: 8 },
                '*::-webkit-scrollbar-thumb': {
                    background: slate200,
                    borderRadius: 8,
                },
            },
        },
        MuiButton: {
            defaultProps: { disableElevation: true },
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    paddingInline: 16,
                    paddingBlock: 9,
                    fontWeight: 600,
                },
                sizeLarge: { paddingBlock: 12 },
                containedPrimary: {
                    boxShadow: `0 6px 16px ${alpha(indigo, 0.25)}`,
                    '&:hover': {
                        boxShadow: `0 8px 22px ${alpha(indigo, 0.35)}`,
                    },
                },
            },
        },
        MuiPaper: {
            defaultProps: { elevation: 0 },
            styleOverrides: {
                rounded: { borderRadius: 16 },
                outlined: { borderColor: slate200 },
            },
        },
        MuiCard: {
            defaultProps: { elevation: 0 },
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    border: `1px solid ${slate200}`,
                    backgroundImage: 'none',
                },
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    backgroundColor: '#FAFBFD',
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderWidth: 1.5,
                    },
                },
            },
        },
        MuiInputLabel: {
            styleOverrides: {
                root: { fontWeight: 500 },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: { fontWeight: 600 },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                head: {
                    fontWeight: 600,
                    color: slate500,
                    textTransform: 'uppercase',
                    fontSize: 12,
                    letterSpacing: '0.06em',
                    borderBottomColor: slate200,
                },
                body: { borderBottomColor: slate200 },
            },
        },
        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    backgroundColor: slate900,
                    fontSize: 12,
                    padding: '6px 10px',
                    borderRadius: 8,
                },
                arrow: { color: slate900 },
            },
        },
        MuiAppBar: {
            defaultProps: { elevation: 0 },
        },
    },
});

export const gradients = {
    hero: 'linear-gradient(135deg, #5B5FE9 0%, #7C5BE9 45%, #10B981 130%)',
    auth:
        'linear-gradient(160deg, rgba(91,95,233,0.95) 0%, rgba(124,91,233,0.95) 55%, rgba(16,185,129,0.9) 120%)',
};
