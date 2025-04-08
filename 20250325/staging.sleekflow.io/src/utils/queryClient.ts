import { broadcastQueryClient } from '@tanstack/query-broadcast-client-experimental';
import { QueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

export const MAX_RETRIES = 3;

export const retryWithPredicate =
  (predicate: (error: any) => boolean = () => true) =>
  (failureCount: number, error: any) => {
    // Don't retry if the error is a 403 access denied error for IP whitelist
    // AccessDeniedError assigns axios error to `cause`
    if (isAxiosError(error.cause) && error.cause?.response?.status === 403) {
      return false;
    }
    if (failureCount > MAX_RETRIES) {
      return false;
    }
    return predicate(error);
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      throwOnError: (error, query) => query.state.data === undefined,
      refetchOnWindowFocus: false,
      staleTime: import.meta.env.VITE_STALE_TIME
        ? Number(import.meta.env.VITE_STALE_TIME)
        : 2 * 60 * 1000,
      gcTime: import.meta.env.VITE_CACHE_TIME
        ? Number(import.meta.env.VITE_CACHE_TIME)
        : 5 * 60 * 1000,
      retry: retryWithPredicate(),
    },
  },
});

// we won't test multi-tab functionality in Vitest, skip instrumentation
if (!import.meta.env.VITEST) {
  broadcastQueryClient({
    queryClient,
    broadcastChannel: 'react-query-sleekflow-web',
  });
}
