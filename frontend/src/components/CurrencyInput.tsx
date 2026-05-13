import { InputAdornment, TextField, TextFieldProps, Typography } from '@mui/material';

type Props = Omit<TextFieldProps, 'onChange' | 'value' | 'type'> & {
    value: string;
    onValueChange: (raw: string) => void;
    symbol?: string;
};

/**
 * Currency input with a leading symbol. Accepts the raw string so the parent
 * can decide validation; only allows digits + at most one decimal with two
 * fraction digits.
 */
export default function CurrencyInput({
    value,
    onValueChange,
    symbol = '₹',
    ...rest
}: Props) {
    const sanitize = (raw: string) => {
        // Strip anything that isn't a digit or "."; collapse multiple dots.
        let s = raw.replace(/[^\d.]/g, '');
        const firstDot = s.indexOf('.');
        if (firstDot !== -1) {
            s =
                s.slice(0, firstDot + 1) +
                s.slice(firstDot + 1).replace(/\./g, '');
        }
        // Cap to 2 decimal places.
        if (firstDot !== -1) {
            const [whole, frac = ''] = s.split('.');
            s = whole + '.' + frac.slice(0, 2);
        }
        // Strip a leading 0 unless it's "0" or "0."
        if (/^0\d/.test(s)) s = s.replace(/^0+/, '');
        return s;
    };

    return (
        <TextField
            {...rest}
            value={value}
            onChange={(e) => onValueChange(sanitize(e.target.value))}
            inputMode="decimal"
            InputProps={{
                ...rest.InputProps,
                startAdornment: (
                    <InputAdornment position="start">
                        <Typography fontWeight={700} color="text.secondary">
                            {symbol}
                        </Typography>
                    </InputAdornment>
                ),
                sx: {
                    fontSize: 22,
                    fontWeight: 600,
                    ...(rest.InputProps?.sx ?? {}),
                },
            }}
            placeholder={rest.placeholder ?? '0.00'}
        />
    );
}
