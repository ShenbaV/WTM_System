import { useQuery } from '@tanstack/react-query';
import { userService, UserLookup } from '../services/user.service';
import { useDebounce } from './useDebounce';

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface LookupState {
    debouncedEmail: string;
    isReady: boolean;          // email is well-formed and we should query
    isLoading: boolean;
    user?: UserLookup;
    notFound: boolean;
    error?: unknown;
}

/**
 * Debounces the email input and hits /api/users/lookup. Returns a state object
 * that maps cleanly to the recipient preview UI:
 *   - notFound:   email is well-formed but no user exists
 *   - user:       user found (use user.isSelf to detect self-transfer)
 *   - isLoading:  request in flight
 */
export function useUserLookup(emailRaw: string, delay = 350): LookupState {
    const trimmed = emailRaw.trim().toLowerCase();
    const debouncedEmail = useDebounce(trimmed, delay);
    const isReady = EMAIL_RX.test(debouncedEmail);

    const query = useQuery({
        queryKey: ['user-lookup', debouncedEmail],
        queryFn: () => userService.lookup(debouncedEmail),
        enabled: isReady,
        retry: false,
        staleTime: 30_000,
        // We treat a 404 as a valid "not found" outcome, not a transient error,
        // so let React Query surface it to the caller via `error`.
    });

    const notFound =
        isReady && !!query.error && (query.error as any)?.response?.status === 404;

    return {
        debouncedEmail,
        isReady,
        isLoading: isReady && query.isFetching,
        user: query.data,
        notFound,
        error: query.error,
    };
}
