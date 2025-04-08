import {
  TravisBackendContactDomainViewModelsUserProfileIdsViewModel,
  TravisBackendConversationDomainViewModelsImportContactHistoryResponse,
  TravisBackendConversationDomainViewModelsUserProfileNoCompanyResponse,
  UserProfileApi,
} from '@sleekflow/sleekflow-core-typescript-rxjs-apis';
import { inject, injectable } from 'inversify';
import {
  catchError,
  combineLatest,
  EMPTY,
  expand,
  map,
  mergeMap,
  Observable,
  of,
  reduce,
  ReplaySubject,
  retry,
  shareReplay,
  switchMap,
  take,
  tap,
  throwError,
} from 'rxjs';

import {
  CACHE_REFRESHING_BEHAVIOUR,
  RxjsUtils,
} from '@/services/rxjs-utils/rxjs-utils';
import { UserProfileWrapper } from '@/services/user-profiles/managers/user-profile-wrapper';
import { GetUserProfilesFilter } from '@/services/user-profiles/models/get-user-profiles-filter';

import { ConversationWrapperManagerService } from '../conversations/managers/conversation-wrapper-manager.service';
import { UserProfileWrapperManagerService } from './managers/user-profile-wrapper-manager.service';

export interface UserProfileList {
  id: number;
  name: string;
}

@injectable()
export class UserProfileService {
  constructor(
    @inject(UserProfileApi) private userProfileApi: UserProfileApi,
    @inject(UserProfileWrapperManagerService)
    private userProfileWrapperManagerService: UserProfileWrapperManagerService,
    @inject(ConversationWrapperManagerService)
    private conversationWrapperManagerService: ConversationWrapperManagerService,
  ) {}

  private readonly userProfileIdToUserProfileReplaySubjectMap = new Map<
    string,
    ReplaySubject<TravisBackendConversationDomainViewModelsUserProfileNoCompanyResponse>
  >();

  private getUserProfile$(userProfileId: string, shouldRefresh = false) {
    const refresh$ = (
      replaySubject: ReplaySubject<TravisBackendConversationDomainViewModelsUserProfileNoCompanyResponse>,
    ) => {
      this.userProfileApi
        .userProfileUserProfileIdGet({
          userProfileId: userProfileId,
        })
        .pipe(
          mergeMap((resp) => {
            if (resp === null || resp === undefined) {
              return throwError(
                () =>
                  new Error(
                    'TravisBackendConversationDomainViewModelsUserProfileNoCompanyResponse is null or empty',
                  ),
              );
            }

            return of(resp);
          }),
          RxjsUtils.getRetryAPIRequest(),
        )
        .subscribe({
          next: (upw) => {
            replaySubject.next(upw);
          },
          error: (error) => {
            replaySubject.error(error);
          },
        });
    };

    let userProfileReplaySubject =
      this.userProfileIdToUserProfileReplaySubjectMap.get(userProfileId);
    if (userProfileReplaySubject === undefined) {
      userProfileReplaySubject =
        new ReplaySubject<TravisBackendConversationDomainViewModelsUserProfileNoCompanyResponse>(
          1,
        );
      this.userProfileIdToUserProfileReplaySubjectMap.set(
        userProfileId,
        userProfileReplaySubject,
      );

      refresh$(userProfileReplaySubject);
    } else {
      if (shouldRefresh) {
        refresh$(userProfileReplaySubject);
      }
    }

    if (shouldRefresh) {
      return userProfileReplaySubject.asObservable();
    }

    return userProfileReplaySubject.asObservable().pipe(take(1));
  }

  public getUserProfileWrapper$(userProfileId: string, shouldRefresh = false) {
    if (
      userProfileId === '' ||
      userProfileId === UserProfileWrapper.initializing().getId()
    ) {
      return of(UserProfileWrapper.initializing());
    }

    const userProfileWrapper =
      this.userProfileWrapperManagerService.getUserProfileWrapper(
        userProfileId,
      );

    if (
      shouldRefresh ||
      userProfileWrapper === undefined ||
      userProfileWrapper?.getFieldIdToValue$$Entries() === undefined ||
      userProfileWrapper?.getFieldIdToValue$$Entries().length === 0
    ) {
      return this.getUserProfile$(userProfileId, shouldRefresh).pipe(
        map(
          (
            travisBackendUserProfileDomainViewModelsUserProfileNoCompanyResponseViewModel,
          ) => {
            return this.userProfileWrapperManagerService.getOrInitUserProfileWrapper(
              userProfileId,
              travisBackendUserProfileDomainViewModelsUserProfileNoCompanyResponseViewModel,
            );
          },
        ),
      );
    }

    return of(userProfileWrapper);
  }

  public searchUserProfiles$(
    offset: number,
    limit: number,
    getUserProfilesParams: GetUserProfilesFilter,
    orderBy?: string,
    orderByFieldName?: string,
  ) {
    return this.userProfileApi
      .userProfileSearchPost({
        offset,
        limit,
        fields: getUserProfilesParams.fields,
        channel: getUserProfilesParams.channel,
        channelIds: getUserProfilesParams.channelIds,
        sortby: orderByFieldName,
        order: orderBy,
        travisBackendCompanyDomainModelsCondition:
          getUserProfilesParams.conditions,
      })
      .pipe(
        map((resp) => {
          const userProfileWrappers = resp.userProfiles!.map(
            (
              up: TravisBackendConversationDomainViewModelsUserProfileNoCompanyResponse,
            ) => {
              const conversationWrapper =
                this.conversationWrapperManagerService.getConversationWrapper(
                  up.conversationId!,
                );
              if (conversationWrapper) {
                conversationWrapper.onNextTravisBackendConversationDomainViewModelsUserProfileNoCompanyResponse(
                  up,
                );
              }

              return this.userProfileWrapperManagerService.getOrInitUserProfileWrapper(
                up.id!,
                up,
              );
            },
          );
          const totalNumOfUserProfiles = resp.totalResult ?? 0;

          return {
            userProfiles: userProfileWrappers,
            totalNumOfUserProfiles,
          };
        }),
      );
  }

  public createContactList$(
    travisBackendContactDomainViewModelsUserProfileIdsViewModel?: TravisBackendContactDomainViewModelsUserProfileIdsViewModel,
  ) {
    return this.userProfileApi
      .userprofileListCreatePost({
        travisBackendContactDomainViewModelsUserProfileIdsViewModel,
      })
      .pipe(
        take(1),
        retry(3),
        tap(() =>
          this.getAllContactLists$(
            CACHE_REFRESHING_BEHAVIOUR.ALWAYS_REFRESH_SERVER,
          ),
        ),
        shareReplay({
          bufferSize: 1,
          refCount: false,
        }),
      );
  }

  public addContactList$(
    groupId: number,
    travisBackendContactDomainViewModelsUserProfileIdsViewModel?: TravisBackendContactDomainViewModelsUserProfileIdsViewModel,
  ) {
    return this.userProfileApi
      .userprofileListGroupIdAddPost({
        groupId,
        travisBackendContactDomainViewModelsUserProfileIdsViewModel,
      })
      .pipe(
        take(1),
        retry(3),
        map((resp) => {
          if (
            travisBackendContactDomainViewModelsUserProfileIdsViewModel &&
            travisBackendContactDomainViewModelsUserProfileIdsViewModel.userProfileIds
          ) {
            for (const userProfileId of travisBackendContactDomainViewModelsUserProfileIdsViewModel.userProfileIds) {
              combineLatest({
                userProfileWrapper: this.getUserProfileWrapper$(
                  userProfileId,
                ).pipe(take(1)),
                allContactLists: this.getAllContactLists$().pipe(take(1)),
              })
                .pipe(
                  take(1),
                  switchMap(({ userProfileWrapper, allContactLists }) => {
                    return userProfileWrapper.getUserProfileLists$().pipe(
                      // Prevent infinite loop
                      take(1),
                      map((userProfileLists) => {
                        return {
                          userProfileWrapper,
                          allContactLists,
                          userProfileLists,
                        };
                      }),
                    );
                  }),
                )
                .subscribe(
                  ({
                    userProfileWrapper,
                    allContactLists,
                    userProfileLists,
                  }) => {
                    const newUserProfileLists = (allContactLists || [])
                      .filter(
                        (listId) =>
                          userProfileLists.some(
                            (exListId) => exListId.id === listId.id,
                          ) || listId.id === groupId,
                      )
                      .map((x) => {
                        return {
                          id: x.id,
                          name: x.importName,
                        } as UserProfileList;
                      });

                    userProfileWrapper.onNextUserProfileLists(
                      newUserProfileLists,
                    );
                  },
                );
            }
          }

          return resp;
        }),
      );
  }

  private allContactListsReplaySubject$$?: ReplaySubject<
    TravisBackendConversationDomainViewModelsImportContactHistoryResponse[]
  >;

  public getAllContactLists$(
    cacheRefreshingBehaviour: CACHE_REFRESHING_BEHAVIOUR = CACHE_REFRESHING_BEHAVIOUR.ALWAYS_REFRESH_CLIENT,
  ) {
    const limit = 200; // Set a reasonable limit

    let offset = 0;

    const {
      replaySubject$$: allContactLists$$,

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      observable$: allContactLists$,
    } = RxjsUtils.cacheAndRetryObservable<
      TravisBackendConversationDomainViewModelsImportContactHistoryResponse[]
    >(
      () => this.allContactListsReplaySubject$$,
      this.userProfileApi.userprofileListGet({ offset: offset, limit }).pipe(
        retry(3), // Retry up to 3 times in case of errors
        expand((resp) => {
          offset += limit;
          // Check if there are more pages to request
          if (
            resp &&
            resp.userGroups &&
            Array.isArray(resp.userGroups) &&
            resp.userGroups.length === limit
          ) {
            return this.userProfileApi
              .userprofileListGet({ offset: offset, limit })
              .pipe(retry(3));
          } else {
            return EMPTY; // No more data, stop recursion
          }
        }),
        map((resp) => resp?.userGroups || []),
        reduce((acc, groups) => {
          return acc.concat(groups);
        }, [] as TravisBackendConversationDomainViewModelsImportContactHistoryResponse[]), // Concatenate all results into one array
        catchError((error) => {
          this.allContactListsReplaySubject$$?.error(error);
          return EMPTY;
        }),
      ),
      cacheRefreshingBehaviour ===
        CACHE_REFRESHING_BEHAVIOUR.ALWAYS_REFRESH_SERVER,
    );

    this.allContactListsReplaySubject$$ = allContactLists$$;

    if (
      cacheRefreshingBehaviour ===
      CACHE_REFRESHING_BEHAVIOUR.ALWAYS_REFRESH_CLIENT
    ) {
      return this.allContactListsReplaySubject$$.asObservable();
    }

    return allContactLists$;
  }

  public removeContactList$(
    groupId: number,
    travisBackendContactDomainViewModelsUserProfileIdsViewModel?: TravisBackendContactDomainViewModelsUserProfileIdsViewModel,
  ): Observable<TravisBackendConversationDomainViewModelsImportContactHistoryResponse> {
    return this.userProfileApi
      .userprofileListGroupIdRemovePost({
        groupId,
        travisBackendContactDomainViewModelsUserProfileIdsViewModel,
      })
      .pipe(
        take(1),
        retry(3),
        map((resp) => {
          if (
            travisBackendContactDomainViewModelsUserProfileIdsViewModel &&
            travisBackendContactDomainViewModelsUserProfileIdsViewModel.userProfileIds
          ) {
            for (const userProfileId of travisBackendContactDomainViewModelsUserProfileIdsViewModel.userProfileIds) {
              combineLatest({
                userProfileWrapper: this.getUserProfileWrapper$(
                  userProfileId,
                ).pipe(take(1)),
                allContactLists: this.getAllContactLists$().pipe(take(1)),
              })
                .pipe(
                  take(1),
                  switchMap(({ userProfileWrapper, allContactLists }) => {
                    return userProfileWrapper.getUserProfileLists$().pipe(
                      // Prevent infinite loop
                      take(1),
                      map((userProfileLists) => {
                        return {
                          userProfileWrapper,
                          allContactLists,
                          userProfileLists,
                        };
                      }),
                    );
                  }),
                )
                .subscribe(
                  ({
                    userProfileWrapper,
                    allContactLists,
                    userProfileLists,
                  }) => {
                    const newUserProfileLists = (allContactLists || [])
                      .filter(
                        (listId) =>
                          userProfileLists.some(
                            (exListId) => exListId.id === listId.id,
                          ) && listId.id !== groupId,
                      )
                      .map((x) => {
                        return {
                          id: x.id,
                          name: x.importName,
                        } as UserProfileList;
                      });

                    userProfileWrapper.onNextUserProfileLists(
                      newUserProfileLists,
                    );
                  },
                );
            }
          }

          return resp;
        }),
      );
  }
}
