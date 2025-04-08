import {
  // eslint-disable-next-line @typescript-eslint/no-restricted-imports
  useAuth0,
  LogoutOptions as Auth0LogoutOptions,
} from '@auth0/auth0-react';
import { useQueryClient } from '@tanstack/react-query';
import { clear } from 'idb-keyval';
import mixpanel from 'mixpanel-browser';
import { useCallback, useMemo } from 'react';

import { useTrackEvent } from '@/utils/applicationInsights';

const clearPersistedQueryCache = clear;

export type LogoutOptions = {
  logEvent?: string;
  logData?: Record<string, unknown>;
  logoutOptions?: Auth0LogoutOptions;
};

export const useAuth = () => {
  const auth0 = useAuth0();
  const queryClient = useQueryClient();
  const { trackEvent } = useTrackEvent();

  const logout = useCallback(
    async (param?: LogoutOptions) => {
      const options =
        param?.logoutOptions ||
        ({
          logoutParams: {
            federated: true,
            returnTo: window.location.origin,
          },
        } as Auth0LogoutOptions);
      mixpanel.reset();
      const data = param?.logData ? { ...param.logData } : undefined;
      trackEvent(param?.logEvent || 'web_logout', data);
      await Promise.all([auth0.logout(options), clearPersistedQueryCache()]);
      queryClient.clear();
    },
    [auth0, queryClient, trackEvent],
  );

  return useMemo(() => ({ ...auth0, logout }), [auth0, logout]);
};
