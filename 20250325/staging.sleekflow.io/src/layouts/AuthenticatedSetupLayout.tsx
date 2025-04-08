import { captureException } from '@sentry/react';
import axios from 'axios';
import { useInjection } from 'inversify-react';
import { ComponentProps, ComponentType, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';

import RXJSAuth0Provider from '@/RXJSAuthProvider';
import { useAuth0AccountIsCompanyRegisteredQuery } from '@/api/auth0Account';
import { axiosClient } from '@/api/axiosClient';
import { useGetCurrentIpQuery } from '@/api/common';
import { useUserWorkspaces } from '@/api/tenantHub';
import AppLoading from '@/components/AppLoading';
import { PersistGate } from '@/components/PersistGate';
import {
  AccessDeniedError,
  ipWhitelistingAccessDeniedError,
} from '@/errors/AccessDeniedError';
import { NotFoundError } from '@/errors/NotFoundError';
import { ServerError } from '@/errors/ServerError';
import { useAuth } from '@/hooks/useAuth';
import { useRefetchPermission } from '@/hooks/usePermission';
import { AuthService } from '@/services/auth.service';
import {
  trackEvent,
  getAuth0TokenFromStorage,
} from '@/utils/applicationInsights';
import { generateV1RedirectionLink } from '@/utils/v1-utils';

const withWorkspaceLocation = (Component: ComponentType) => {
  const MyComp = (props: ComponentProps<any>) => {
    const { data: userWorkspaces } = useUserWorkspaces({ staleTime: 0 });
    const authService = useInjection(AuthService);

    if (userWorkspaces) {
      const defaultWorkspace = userWorkspaces.find((w) => w.is_default);

      if (!defaultWorkspace) {
        throw new ServerError({
          message: 'cannot find user location workspace',
        });
      }

      axiosClient.interceptors.request.use(async (config) => {
        config.headers.set(
          'X-Sleekflow-Location',
          defaultWorkspace.server_location,
        );
        return config;
      });

      authService.setupIsInitialized(true);
    } else {
      return <AppLoading />;
    }

    return <Component {...props} />;
  };

  MyComp.displayName = 'withWorkspaceLocation';

  return MyComp;
};

const withCompanyCheck = (Component: any) => {
  const MyComp = (props: ComponentProps<any>) => {
    const isCompanyRegisteredQuery = useAuth0AccountIsCompanyRegisteredQuery();
    const { user } = useAuth();
    const [token] = useState(() => getAuth0TokenFromStorage());

    if (isCompanyRegisteredQuery.isLoading) {
      return <AppLoading />;
    }

    if (!isCompanyRegisteredQuery.data?.data?.is_company_registered) {
      trackEvent('company_not_register_finished_and_redirect_to_v1', {
        userId: user?.['https://app.sleekflow.io/user_id'],
        accessToken: token.accessToken || 'unknown',
        refreshToken: token.refreshToken || 'unknown',
      });
      window.location.replace(
        generateV1RedirectionLink({
          path: '/',
        }),
      );

      return <AppLoading />;
    }

    return <Component {...props} />;
  };

  MyComp.displayName = 'WithCompanyCheck';

  return MyComp;
};

const Component = withCompanyCheck(withWorkspaceLocation(Outlet));

export default function AuthenticatedSetupLayout() {
  const { t } = useTranslation();
  const { refetch } = useRefetchPermission();

  const { data: currentIp } = useGetCurrentIpQuery();
  const { getAccessTokenSilently, logout } = useAuth();
  axiosClient.interceptors.request.clear();
  axiosClient.interceptors.request.use(async (config) => {
    const accessToken = await getAccessTokenSilently();
    if (accessToken && !config.skipAuth) {
      config.headers.setAuthorization(`Bearer ${accessToken}`);
    }
    return config;
  });
  axiosClient.interceptors.response.clear();
  axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (axios.isAxiosError(error)) {
        // Axios's cancelled error message is just canceled, regardless browser
        if (error.message !== 'canceled') {
          captureException(error);
        }
        if (error.response?.status === 401) {
          logout({
            logEvent: 'web_logout_unauthorized_error_401',
            logoutOptions: {
              openUrl() {
                window.location.replace(window.location.origin);
              },
            },
          });
        }
        if (error.response?.status === 404) {
          throw new NotFoundError({
            cause: error,
            message: error.message,
          });
        }
        if (
          error.response?.status === 403 &&
          error.response?.data.errorCode === 'RBAC_ACCESS_DENIED'
        ) {
          refetch();
          throw new AccessDeniedError();
        }
        if (error.response?.status === 403) {
          throw new AccessDeniedError({
            name: ipWhitelistingAccessDeniedError,
            cause: error,
            action: {
              onClick: () => {
                logout({ logEvent: 'web_logout_non_ip_white_list' });
              },
              label: t('access-denied-non-ip-white-list.back-button', {
                defaultValue: 'Back to Sign In',
              }),
            },
            description: (
              <>
                {t('access-denied-non-ip-white-list.description', {
                  defaultValue:
                    'Access to SleekFlow from your current IP address ({ip}) is blocked for security reasons. Please contact your workspace admin for assistance.',
                  ip: currentIp?.ipAddress ?? '',
                })}
              </>
            ),
          });
        }
      }
      throw error;
    },
  );

  return (
    <PersistGate>
      <RXJSAuth0Provider>
        <Component />
      </RXJSAuth0Provider>
    </PersistGate>
  );
}
