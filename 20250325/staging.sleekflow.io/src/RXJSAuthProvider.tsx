import getContainer from '@/inversify.config';
import { Provider, useInjection } from 'inversify-react';

import { AuthService } from '@/services/auth.service';
import { useAuth } from './hooks/useAuth';

export default function RXJSAuth0Provider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider container={() => getContainer()}>
      <AuthServiceSetup>{children}</AuthServiceSetup>
    </Provider>
  );
}

const AuthServiceSetup = ({ children }: { children: React.ReactNode }) => {
  const {
    getAccessTokenSilently,
    isAuthenticated,
    user,
    getIdTokenClaims,
    loginWithRedirect,
    logout,
  } = useAuth();

  const authService = useInjection(AuthService);

  authService.setupGetAccessTokenSilently(getAccessTokenSilently);
  authService.setupUser(user);
  authService.setupGetIdTokenClaims(getIdTokenClaims);
  authService.setupLoginWithRedirect(loginWithRedirect);
  authService.setupLogout(logout);
  // IsAuthenticated must be the last one
  authService.setupIsAuthenticated(isAuthenticated);

  return <>{children}</>;
};
