import { User } from '@auth0/auth0-react';
import {
  CompanyApi,
  TravisBackendMessageDomainViewModelsCompanyHashtagResponse,
} from '@sleekflow/sleekflow-core-typescript-rxjs-apis';
import type {
  TravisBackendConversationDomainViewModelsCompanyCustomUserProfileFieldOptionViewModel,
  TravisBackendConversationDomainViewModelsCompanyCustomUserProfileFieldViewModel,
  TravisBackendConversationDomainViewModelsCustomUserProfileFieldLingualViewModel,
  TravisBackendConversationDomainViewModelsCompanyResponse,
} from '@sleekflow/sleekflow-core-typescript-rxjs-apis';
import dayjs from 'dayjs';
import { inject, injectable } from 'inversify';
import {
  combineLatest,
  concatMap,
  filter,
  from,
  map,
  Observable,
  of,
  ReplaySubject,
  shareReplay,
  switchMap,
  take,
} from 'rxjs';
import { queryClient } from '@/utils/queryClient';
import { getCompanyOptions } from '@/api/company';

import {
  CACHE_REFRESHING_BEHAVIOUR,
  RxjsUtils,
} from '@/services/rxjs-utils/rxjs-utils';

import { AuthService } from './auth.service';
import type { CompanyTeam, Staff } from './companies/company.service';
import type { ConversationWrapperLabel } from './conversations/managers/conversation-wrapper';

export interface Company {
  id: string;
  userProfileFields: CompanyUserProfileField[];
  labels: ConversationWrapperLabel[];
}

export interface CompanyUserProfileFieldLingual {
  language: string;
  displayName: string;
}

export interface CompanyUserProfileFieldOption {
  id: number;
  linguals: Array<CompanyUserProfileFieldLingual>;
  value: string | null;
  order: number;
}

export interface CompanyUserProfileField {
  id: string;
  name: string;
  type: string;
  order: number;
  isVisible: boolean;
  isEditable: boolean;
  isDefault: boolean;
  isDeletable: boolean;
  fieldsCategory: string;

  linguals: Array<CompanyUserProfileFieldLingual>;
  options: Array<CompanyUserProfileFieldOption>;
}

export interface LoginAsUser {
  company_id: string;
  expire_at: Date;
  staff_id: number;
  user_id: string;
}

const tryParseJSON = (str: string) => {
  try {
    return JSON.parse(str);
  } catch (_e) {
    return null;
  }
};

@injectable()
export class UserService {
  private readonly userId$;

  constructor(
    @inject(AuthService) private authService: AuthService,
    @inject(CompanyApi) private companyApi: CompanyApi,
  ) {
    this.userId$ = this.authService.getIsAuthenticated$().pipe(
      filter((isAuthenticated) => isAuthenticated),
      concatMap(() =>
        this.authService.getIdToken$().pipe(
          map((claims) => {
            const loginAsUserStr = (claims as any)[
              'https://app.sleekflow.io/login_as_user'
            ] as string;
            const loginAsUser: LoginAsUser | null = loginAsUserStr
              ? tryParseJSON(loginAsUserStr)
              : null;
            const diveTimeRemaining = loginAsUser?.expire_at
              ? dayjs(loginAsUser?.expire_at).diff(dayjs(), 'seconds')
              : 0;

            return diveTimeRemaining > 0 && loginAsUser
              ? loginAsUser.user_id
              : ((claims as any)['https://app.sleekflow.io/user_id'] as string);
          }),
        ),
      ),
      shareReplay({
        bufferSize: 1,
        refCount: false,
      }),
    );
  }

  public getMyUserId$() {
    return this.userId$;
  }

  private myStaffReplaySubject$$?: ReplaySubject<Staff> = undefined;

  public getMyStaff$(
    cacheRefreshingBehaviour: CACHE_REFRESHING_BEHAVIOUR = CACHE_REFRESHING_BEHAVIOUR.NEVER_REFRESH,
  ) {
    const { replaySubject$$: myStaffReplaySubject$$, observable$: myStaff$ } =
      RxjsUtils.cacheAndRetryObservable<Staff>(
        () => this.myStaffReplaySubject$$,
        this.userId$.pipe(
          concatMap((userId) =>
            combineLatest({
              companyStaffs: this.companyApi
                .companyStaffStaffIdGet({
                  staffId: userId,
                })
                .pipe(
                  map((resp: any) => {
                    return resp;
                  }),
                ),
              user: this.authService.getUser$().pipe(
                // sometimes user is undefined
                filter((user) => user !== undefined),
                take(1),
              ),
            }).pipe(
              map(({ companyStaffs, user }) => {
                const companyStaff = companyStaffs[0];
                const staff = this.toStaff(companyStaff, user as User);

                return staff;
              }),
              filter((staff) => staff !== undefined),
            ),
          ),
        ),
        cacheRefreshingBehaviour ===
          CACHE_REFRESHING_BEHAVIOUR.ALWAYS_REFRESH_SERVER,
      );

    this.myStaffReplaySubject$$ = myStaffReplaySubject$$;

    if (
      cacheRefreshingBehaviour ===
      CACHE_REFRESHING_BEHAVIOUR.ALWAYS_REFRESH_CLIENT
    ) {
      return this.myStaffReplaySubject$$.asObservable();
    }

    return myStaff$;
  }

  private toStaff(obj: any, user: User): Staff {
    const staff: Staff = {
      connectionStrategy: user['https://app.sleekflow.io/connection_strategy'],
      id: obj.userInfo.id!,
      staffId: obj.staffId!,
      displayName: obj.userInfo.displayName,
      firstName: (obj.userInfo.firstName || '').trim(),
      lastName: (obj.userInfo.lastName || '').trim(),
      email: obj.userInfo.email || '',
      associatedTeams: obj.associatedTeams!.map(
        (obj: any) => obj as CompanyTeam,
      ),
      roleType: obj.roleType,
      shouldShowSenderName: obj.isShowName,
      status: obj.status,
    };
    return staff;
  }

  public getMyCompany$() {
    const queryOptions = getCompanyOptions();

    const cache = queryClient.getQueryData(queryOptions.queryKey);

    const observable$ = cache
      ? of(cache)
      : from(queryClient.fetchQuery(queryOptions));

    return observable$.pipe(map((resp) => this.toCompany(resp)));
  }

  private toCompany(
    resp: TravisBackendConversationDomainViewModelsCompanyResponse,
  ): Company {
    return {
      id: resp.id!,
      userProfileFields: resp.customUserProfileFields!.map(
        (
          obj: TravisBackendConversationDomainViewModelsCompanyCustomUserProfileFieldViewModel,
        ) => {
          return {
            id: obj.id!,
            name: obj.fieldName!,
            type: obj.type!,
            order: obj.order!,
            isVisible: obj.isVisible!,
            isEditable: obj.isEditable!,
            isDefault: obj.isDefault!,
            isDeletable: obj.isDeletable!,
            fieldsCategory: obj.fieldsCategory!,
            linguals: obj!.customUserProfileFieldLinguals!.map(
              (
                obj: TravisBackendConversationDomainViewModelsCustomUserProfileFieldLingualViewModel,
              ) => {
                return {
                  language: obj.language!,
                  displayName: obj.displayName!,
                };
              },
            ),
            options: obj.customUserProfileFieldOptions!.map(
              (
                obj: TravisBackendConversationDomainViewModelsCompanyCustomUserProfileFieldOptionViewModel,
              ) => {
                return {
                  id: obj.id!,
                  linguals: obj.customUserProfileFieldOptionLinguals!.map(
                    (
                      obj: TravisBackendConversationDomainViewModelsCustomUserProfileFieldLingualViewModel,
                    ) => {
                      return {
                        language: obj.language!,
                        displayName: obj.displayName!,
                      };
                    },
                  ),
                  value: obj.value!,
                  order: obj.order!,
                };
              },
            ),
          };
        },
      ),
      labels: resp.companyHashtags
        ? resp.companyHashtags.map(
            (
              obj: TravisBackendMessageDomainViewModelsCompanyHashtagResponse,
            ) => {
              return {
                id: obj.id!,
                name: obj.hashtag!,
                color: obj.hashTagColor!,
                type: obj.hashTagType!,
              };
            },
          )
        : [],
    };
  }

  public getAllUserProfileFieldMap$() {
    return this.getMyCompany$().pipe(
      map((company) =>
        company.userProfileFields.reduce(function (map, obj) {
          map.set(obj.id, obj);
          return map;
        }, new Map<string, CompanyUserProfileField>()),
      ),
    );
  }

  public updateIsShowName$(isShowName: boolean): Observable<Staff> {
    // https://sleekflow-core-dev-e6d7dyf5drg4eag5.z01.azurefd.net/Company/Staff/b71f3882-381f-4842-919b-ad8ec768125e
    return this.getMyUserId$().pipe(
      switchMap((myUserId) => {
        return this.companyApi
          .companyStaffStaffIdPost({
            staffId: myUserId,
            travisBackendCompanyDomainViewModelsStaffInfoViewModel: {
              isShowName: isShowName,
            },
          })
          .pipe(
            switchMap(() =>
              this.getMyStaff$(
                CACHE_REFRESHING_BEHAVIOUR.ALWAYS_REFRESH_SERVER,
              ),
            ),
            RxjsUtils.getRetryAPIRequest(),
          );
      }),
    );
  }

  public updateStatus$(status: string): Observable<Staff> {
    // https://sleekflow-core-dev-e6d7dyf5drg4eag5.z01.azurefd.net/Company/Staff/b71f3882-381f-4842-919b-ad8ec768125e
    return this.getMyUserId$().pipe(
      switchMap((myUserId) => {
        return this.companyApi
          .companyStaffStaffIdPost({
            staffId: myUserId,
            travisBackendCompanyDomainViewModelsStaffInfoViewModel: {
              status: status as any,
            },
          })
          .pipe(
            switchMap(() =>
              this.getMyStaff$(
                CACHE_REFRESHING_BEHAVIOUR.ALWAYS_REFRESH_SERVER,
              ),
            ),
            RxjsUtils.getRetryAPIRequest(),
          );
      }),
    );
  }
}
