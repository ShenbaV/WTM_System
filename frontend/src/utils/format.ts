export function formatCurrency(
    amount: number,
    currency = 'INR',
    locale = 'en-IN'
): string {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
    }).format(Number.isFinite(amount) ? amount : 0);
}

export function formatCurrencyCompact(amount: number, currency = 'INR'): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency,
        notation: 'compact',
        maximumFractionDigits: 1,
    }).format(Number.isFinite(amount) ? amount : 0);
}

export function formatDate(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString(undefined, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function formatRelative(iso: string): string {
    const d = new Date(iso).getTime();
    if (Number.isNaN(d)) return iso;
    const diffMs = Date.now() - d;
    const sec = Math.round(diffMs / 1000);
    if (sec < 60) return 'just now';
    const min = Math.round(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hr = Math.round(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const day = Math.round(hr / 24);
    if (day < 7) return `${day}d ago`;
    return new Date(iso).toLocaleDateString(undefined, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

export function initials(name: string | undefined | null): string {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Deterministic gradient avatar bg from a string seed (e.g. email) */
export function avatarColor(seed: string): string {
    const palette = [
        'linear-gradient(135deg,#5B5FE9,#8487F0)',
        'linear-gradient(135deg,#10B981,#34D399)',
        'linear-gradient(135deg,#F59E0B,#FBBF24)',
        'linear-gradient(135deg,#EF4444,#F87171)',
        'linear-gradient(135deg,#0EA5E9,#38BDF8)',
        'linear-gradient(135deg,#8B5CF6,#A78BFA)',
        'linear-gradient(135deg,#EC4899,#F472B6)',
    ];
    let hash = 0;
    for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
    return palette[Math.abs(hash) % palette.length];
}
