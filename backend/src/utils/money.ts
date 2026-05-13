/**
 * Money is stored as BIGINT paise/cents in the database.
 * Helpers below convert between major-unit (rupees/dollars) doubles used in HTTP
 * payloads and integer minor-units used internally. We round to avoid float drift.
 */

export function toMinorUnits(major: number): bigint {
    if (!Number.isFinite(major)) {
        throw new Error('Amount must be a finite number');
    }
    // Multiply, round, then convert through string to avoid bigint precision issues.
    const minor = Math.round(major * 100);
    return BigInt(minor);
}

export function fromMinorUnits(minor: bigint | string | number): number {
    const asBig = typeof minor === 'bigint' ? minor : BigInt(minor);
    // Convert to Number safely — wallet balances are practically far below 2^53.
    const whole = Number(asBig / 100n);
    const fraction = Number(asBig % 100n);
    return whole + fraction / 100;
}
