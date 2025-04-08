import { withAuthenticationRequired } from '@auth0/auth0-react';
import { Suspense, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';

import AppLoading from '../components/AppLoading';

export default function AuthenticationRequiredLayout() {
  const { i18n } = useTranslation();
  const { error, logout } = useAuth();

  const Component = useMemo(
    () =>
      withAuthenticationRequired(Outlet, {
        onRedirecting: () => <AppLoading />,
        loginOptions: {
          authorizationParams: {
            ui_locales: i18n.language === 'zh-HK' ? 'zh-TW' : i18n.language,
          },
        },
      }),
    [i18n.language],
  );

  if (error) {
    // TODO: Add simple error handling first
    logout({
      logEvent: 'web_logout_got_error_from_auth0',
      logData: { error: error.message },
    });
    return;
  }

  return (
    <Suspense fallback={<AppLoading />}>
      <Component />
    </Suspense>
  );
}
