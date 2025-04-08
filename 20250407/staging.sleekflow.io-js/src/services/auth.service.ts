import {
  GetTokenSilentlyOptions,
  IdToken,
  RedirectLoginOptions,
  User,
} from '@auth0/auth0-react';
import { injectable } from 'inversify';
import { catchError, distinct, from, Observable, ReplaySubject } from 'rxjs';

import { LogoutOptions } from '@/hooks/useAuth';

@injectable()
export class AuthService {
  private isAuthenticated$$ = new ReplaySubject<boolean>(1);
  private isInitialized$$ = new ReplaySubject<boolean>(1);
  private user$$ = new ReplaySubject<User | undefined>(1);
  private error$$ = new ReplaySubject<Error | undefined>(1);

  private getAccessTokenSilently?: (
    options?: GetTokenSilentlyOptions,
  ) => Promise<string>;
  private getIdTokenClaims?: () => Promise<IdToken | undefined>;
  private loginWithRedirect?: (options?: RedirectLoginOptions) => Promise<void>;
  private logout?: (options?: LogoutOptions) => Promise<void>;

  constructor() {
    this.error$$.subscribe((err) => {
      console.error('Caught an error', err);

      if (this.loginWithRedirect) {
        this.loginWithRedirect({});
      }
    });
  }

  public getAccessTokenSilently$(
    options?: GetTokenSilentlyOptions,
  ): Observable<string> {
    if (this.getAccessTokenSilently === undefined) {
      throw new Error(
        'getAccessTokenSilently is not set. Call setupGetAccessTokenSilently first.',
      );
    }

    return from(this.getAccessTokenSilently(options)).pipe(
      catchError((err) => {
        this.error$$.next(err);

        return from(Promise.reject(err));
      }),
    );
  }

  public getIsAuthenticated$() {
    return this.isAuthenticated$$.asObservable().pipe(distinct());
  }

  public getIsInitialized$() {
    return this.isInitialized$$.asObservable().pipe(distinct());
  }

  public getUser$() {
    return this.user$$.asObservable().pipe(distinct());
  }

  public getIdToken$(): Observable<IdToken | undefined> {
    if (this.getIdTokenClaims === undefined) {
      throw new Error(
        'getIdTokenClaims is not set. Call setupGetIdTokenClaims first.',
      );
    }

    return from(this.getIdTokenClaims());
  }

  public logout$(options?: LogoutOptions): Observable<void> {
    if (this.logout === undefined) {
      throw new Error('getLogout$ is not set. Call getLogout$ first.');
    }

    return from(this.logout(options));
  }

  public setupGetAccessTokenSilently(getAccessTokenSilently: {
    (options?: GetTokenSilentlyOptions): Promise<string>;
  }) {
    this.getAccessTokenSilently = getAccessTokenSilently;
  }

  public setupIsAuthenticated(isAuthenticated: boolean) {
    this.isAuthenticated$$.next(isAuthenticated);
  }

  public setupUser(user: User | undefined) {
    this.user$$.next(user);
  }

  public setupGetIdTokenClaims(
    getIdTokenClaims: () => Promise<IdToken | undefined>,
  ) {
    this.getIdTokenClaims = getIdTokenClaims;
  }

  public setupLoginWithRedirect(
    loginWithRedirect: (options?: RedirectLoginOptions) => Promise<void>,
  ) {
    this.loginWithRedirect = loginWithRedirect;
  }

  public setupLogout(logout: (options?: LogoutOptions) => Promise<void>) {
    this.logout = logout;
  }

  public setupIsInitialized(isInitialized: boolean) {
    this.isInitialized$$.next(isInitialized);
  }
}
