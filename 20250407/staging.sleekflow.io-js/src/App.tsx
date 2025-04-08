// eslint-disable-next-line @typescript-eslint/no-restricted-imports -- not using logout
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { CssBaseline, GlobalStyles } from '@mui/material';
import ThemeProvider from '@mui/material/styles/ThemeProvider';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { PersistQueryClientProvider as BasePersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { usePostHog } from 'posthog-js/react';
import { Suspense } from 'react';
import { Outlet, useNavigate, useSearchParams } from 'react-router-dom';

import { AdapterDayjs } from '@/components/DatePicker/AdapterDayjs';
import LocalizationProvider from '@/components/DatePicker/LocalisationProvider';
import V2LocalizationProvider from '@/components/date-time-pickers/LocalizationProvider';
import { useLocaleSetup } from '@/hooks/useLocaleSetup';

import GlobalErrorBoundary from './GlobalErrorBoundary';
import RouteWithHelmet from './RouteWithHelmet';
import Toaster from './Toaster';
import AppLoading from './components/AppLoading';
import { ROUTES } from './constants/navigation';
import theme from './themes';
import {
  trackEvent,
  getAuth0TokenFromStorage,
} from './utils/applicationInsights';
import { lazyWithRetries } from './utils/lazy-loading';
import { queryClient } from './utils/queryClient';
import { createPersistOptions } from './utils/queryPersister';

const GlobalDialogs = lazyWithRetries(() => import('./dialogs'));

function App() {
  useLocaleSetup();

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles
        styles={{
          html: {
            height: '100%',
            overflow: 'hidden',
          },
          body: {
            height: '100%',
            overflow: 'hidden',
          },
          'body.beamerAnnouncementBarTopActive': {
            paddingTop: '0px !important',
          },
        }}
      />
      <CssBaseline />
      <GlobalErrorBoundary>
        <Auth0ProviderWithRedirect>
          <PersistQueryClientProvider>
            <V2LocalizationProvider>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Toaster />
                <RouteWithHelmet>
                  <Outlet />
                  <Suspense fallback={null}>
                    <GlobalDialogs />
                  </Suspense>
                </RouteWithHelmet>
              </LocalizationProvider>
            </V2LocalizationProvider>
            <ReactQueryDevtools initialIsOpen={false} />
          </PersistQueryClientProvider>
        </Auth0ProviderWithRedirect>
      </GlobalErrorBoundary>
    </ThemeProvider>
  );
}

function Auth0ProviderWithRedirect({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const screenHint = searchParams.get('screen_hint');
  const posthog = usePostHog();

  return (
    <Auth0Provider
      useRefreshTokens
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        redirect_uri: window.location.origin,
        screen_hint: screenHint || undefined, // determine login or signup widget to show after redirection
      }}
      onRedirectCallback={(appState, user) => {
        const redirectFromAuth0 = appState?.returnTo || ROUTES.inbox;
        const { accessToken, refreshToken } = getAuth0TokenFromStorage();
        posthog.reset(); // Reset PostHog after new login + before identify is called
        navigate(redirectFromAuth0);
        trackEvent('login_redirect_from_auth0', {
          userId: user?.['https://app.sleekflow.io/user_id'],
          keepMeSignInTime: user?.['https://app.sleekflow.io/keep_me_sign_in'],
          screen_hint: screenHint,
          returnTo: redirectFromAuth0,
          accessToken: accessToken || 'unknown',
          refreshToken: refreshToken || 'unknown',
        });
      }}
      cacheLocation="localstorage"
    >
      {children}
    </Auth0Provider>
  );
}

export const PersistQueryClientProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user, isLoading } = useAuth0();

  if (isLoading) return <AppLoading />;

  return (
    <BasePersistQueryClientProvider
      client={queryClient}
      persistOptions={createPersistOptions(user)}
    >
      {children}
    </BasePersistQueryClientProvider>
  );
};

export default App;
