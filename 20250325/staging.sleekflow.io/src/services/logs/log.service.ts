import {
  captureException,
  captureMessage,
  Scope,
  withScope,
} from '@sentry/react';
import { inject, injectable } from 'inversify';
import { combineLatest, filter, startWith, switchMap } from 'rxjs';

import type { Staff } from '@/services/companies/company.service';
import { type Company, UserService } from '@/services/user.service';

import { AuthService } from '../auth.service';

@injectable()
export class LogService {
  private myStaff: Staff | null = null;
  private myCompany: Company | null = null;

  constructor(
    @inject(AuthService) private authService: AuthService,
    @inject(UserService) private userService: UserService,
  ) {
    this.authService
      .getIsInitialized$()
      .pipe(
        filter((t) => t),
        switchMap(() =>
          combineLatest({
            myStaff: this.userService.getMyStaff$().pipe(startWith(null)),
            myCompany: this.userService.getMyCompany$().pipe(startWith(null)),
          }),
        ),
      )
      .subscribe(({ myStaff, myCompany }) => {
        this.myStaff = myStaff;
        this.myCompany = myCompany;
      });
  }

  public log(message: string, ...data: any[]) {
    try {
      console.log(message, ...data);
    } catch (_e) {
      console.error('Unable to log the data.');
      console.error(message);
    }

    try {
      const scope = new Scope();

      scope.setUser({
        id: this.myStaff?.id,
        email: this.myStaff?.email,
        staffId: this.myStaff?.staffId,
        companyId: this.myCompany?.id,
      });

      scope.setLevel('info');

      captureMessage(message, scope);
    } catch (_e) {
      console.error('Unable to capture the log.');
      console.error(message);
    }
  }

  public error(message: string | any, ...data: any[]) {
    try {
      console.error(message, ...data);
    } catch (_e) {
      console.error('Unable to log the data.');
      console.error(message);
    }

    try {
      const scope = new Scope();

      scope.setUser({
        id: this.myStaff?.id,
        email: this.myStaff?.email,
        staffId: this.myStaff?.staffId,
        companyId: this.myCompany?.id,
      });

      scope.setLevel('error');

      captureException(message, scope);
    } catch (_e) {
      console.error('Unable to capture the error log.');
      console.error(message);
    }
  }

  // use this sparingly as it will bypass the sampling rate and use up the error quota faster
  public critical(
    exception: unknown,
    hint?: Parameters<typeof captureException>[1],
  ) {
    withScope((scope) => {
      scope.setTag('bypass_sampling', true);
      captureException(exception, hint);
    });
  }
}
