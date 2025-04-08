// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { useAuth0 } from '@auth0/auth0-react';
import { ReactPlugin } from '@microsoft/applicationinsights-react-js';
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { useCallback } from 'react';

import { useCompany } from '@/api/company';

export const reactPlugin = import.meta.env.VITE_APP_INSIGHTS_CONNECTION_STRING
  ? new ReactPlugin()
  : (undefined as unknown as ReactPlugin);

export const setupAppInsights = () => {
  if (import.meta.env.VITE_APP_INSIGHTS_CONNECTION_STRING) {
    const appInsights = new ApplicationInsights({
      config: {
        connectionString: import.meta.env.VITE_APP_INSIGHTS_CONNECTION_STRING,
        extensions: [reactPlugin],
        enableAutoRouteTracking: false,
      },
    });
    appInsights.loadAppInsights();
    appInsights.trackPageView();
  }
};

export const trackEvent = (
  name: string,
  properties?: Record<string, unknown>,
) => {
  if (reactPlugin) {
    reactPlugin.trackEvent({
      name,
      properties: { platform: 'web', version: 'v2', ...properties },
    });
  }
};

export const useTrackEvent = () => {
  const { data: companyId, isLoading } = useCompany({
    select: (data) => data.id,
  });
  const { user } = useAuth0();

  const trackEventWrapper = useCallback(
    async (name: string, properties?: Record<string, unknown>) => {
      const { refreshToken, accessToken } = getAuth0TokenFromStorage();
      return trackEvent(name, {
        ...properties,
        accessToken: accessToken || 'unknown',
        refreshToken: refreshToken || 'unknown',
        userId: user?.['https://app.sleekflow.io/user_id'] || 'unknown',
        companyId: companyId || 'unknown',
      });
    },
    [companyId, user],
  );

  return {
    trackEvent: trackEventWrapper,
    isLoading,
  };
};

// Probably failed to get token from local storage and need to check the key
export function getAuth0TokenFromStorage() {
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
  const audience = import.meta.env.VITE_AUTH0_AUDIENCE;
  const scope = 'openid profile email offline_access';

  const key = `@@auth0spajs@@::${clientId}::${audience}::${scope}`;
  const storedData = localStorage.getItem(key);

  if (storedData) {
    try {
      const parsedData = JSON.parse(storedData);
      if (parsedData.body) {
        return {
          accessToken: parsedData.body?.access_token || null,
          refreshToken: parsedData.body?.refresh_token || null,
        };
      }
    } catch (error) {
      console.error('Failed to parse auth0 token from storage:', error);
      return {
        accessToken: null,
        refreshToken: null,
      };
    }
  }
  return {
    accessToken: null,
    refreshToken: null,
  };
}
