import { Avatar, SxProps, Tooltip } from '@mui/material';
import { avatarColor, initials } from '../utils/format';

interface Props {
    name?: string | null;
    email?: string | null;
    size?: number;
    sx?: SxProps;
    tooltip?: boolean;
}

export default function UserAvatar({
    name,
    email,
    size = 36,
    sx,
    tooltip = false,
}: Props) {
    const seed = email ?? name ?? '?';
    const av = (
        <Avatar
            sx={{
                width: size,
                height: size,
                fontWeight: 700,
                fontSize: size * 0.4,
                color: '#fff',
                background: avatarColor(seed),
                ...sx,
            }}
        >
            {initials(name ?? email)}
        </Avatar>
    );
    if (tooltip && (name || email)) {
        return <Tooltip title={`${name ?? ''}${name && email ? ' • ' : ''}${email ?? ''}`}>{av}</Tooltip>;
    }
    return av;
}
