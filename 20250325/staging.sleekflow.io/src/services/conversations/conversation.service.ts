import type {
  TravisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel,
  TravisBackendConversationDomainViewModelsConversationWithCountViewModel,
  TravisBackendConversationDomainViewModelsSearchUserConversationResponse,
  TravisBackendMessageDomainViewModelsConversationMessageResponseViewModel,
} from '@sleekflow/sleekflow-core-typescript-rxjs-apis';
import {
  ConversationApi,
  UserProfileApi,
} from '@sleekflow/sleekflow-core-typescript-rxjs-apis';
import { inject, injectable } from 'inversify';
import {
  combineLatest,
  concatMap,
  delay,
  filter,
  map,
  merge,
  Observable,
  of,
  ReplaySubject,
  Subject,
  switchMap,
  take,
  tap,
} from 'rxjs';

import { ConversationMessageService } from '@/services/conversation-messages/conversation-message.service';
import { SendingConversationMessageManager } from '@/services/conversation-messages/managers/sending-conversation-message-manager';
import { LabelService } from '@/services/labels/label.service';
import { RxjsUtils } from '@/services/rxjs-utils/rxjs-utils';
import { UserService } from '@/services/user.service';

import { ConversationMessageWrapper } from '../conversation-messages/managers/conversation-message-wrapper';
import { ConversationMessageWrapperManagerService } from '../conversation-messages/managers/conversation-message-wrapper-manager.service';
import { LogService } from '../logs/log.service';
import { PermissionService } from '../permissions/permission.service';
import { ClassicRealTimeService } from '../signal-r/classic-real-time.service';
import { UserProfileWrapper } from '../user-profiles/managers/user-profile-wrapper';
import { UserProfileWrapperManagerService } from '../user-profiles/managers/user-profile-wrapper-manager.service';
import { ConversationMatcherService } from './conversation-matcher.service';
import { GetConversationBehaviorVersion } from './conversation-utils';
import { ConversationWrapper } from './managers/conversation-wrapper';
import {
  ConversationWrapperManagerService,
  type ConversationWrapperUpdate,
} from './managers/conversation-wrapper-manager.service';
import { GetConversationsFilter } from './models/get-conversations-filter';
import { shouldIgnoreSearchMessageEndpointBackendCache } from './utils';

@injectable()
export class ConversationService {
  constructor(
    @inject(ConversationApi) private conversationApi: ConversationApi,
    @inject(ConversationWrapperManagerService)
    private conversationWrapperManagerService: ConversationWrapperManagerService,
    @inject(ClassicRealTimeService)
    private classicRealTimeService: ClassicRealTimeService,
    @inject(ConversationMatcherService)
    private conversationMatcherService: ConversationMatcherService,
    @inject(UserProfileWrapperManagerService)
    private userProfileWrapperManagerService: UserProfileWrapperManagerService,
    @inject(UserProfileApi)
    private userProfileApi: UserProfileApi,
    @inject(ConversationMessageWrapperManagerService)
    private conversationMessageWrapperManagerService: ConversationMessageWrapperManagerService,
    @inject(UserService)
    private userService: UserService,
    @inject(ConversationMessageService)
    private conversationMessageService: ConversationMessageService,
    @inject(LabelService)
    private labelService: LabelService,
    @inject(SendingConversationMessageManager)
    private sendingConversationMessageManager: SendingConversationMessageManager,
    @inject(PermissionService)
    private permissionService: PermissionService,
    @inject(LogService)
    private logService: LogService,
  ) {}

  public getCachedConversationUpdate$(): Observable<
    [ConversationWrapper, ConversationWrapperUpdate]
  > {
    return this.conversationWrapperManagerService
      .getConversationWrapperUpdate$()
      .pipe(
        filter(
          ({ id }) =>
            !!this.conversationWrapperManagerService.getConversationWrapper(id),
        ),
        map((conversationWrapperUpdate) => [
          this.conversationWrapperManagerService.getConversationWrapper(
            conversationWrapperUpdate.id,
          )!,
          conversationWrapperUpdate,
        ]),
      );
  }

  public getOngoingUpdatedConversation$(
    getConversationsFilter: GetConversationsFilter,
  ) {
    const observable1 = merge(
      this.classicRealTimeService.getOnConversationMessageChanged$(),
      this.sendingConversationMessageManager.getSentMessage$(),
    ).pipe(
      tap((payload) => {
        if (!payload.id || !payload.conversationId) {
          this.logService.critical(
            new Error(
              'received payload with missing id or conversationId in getOngoingUpdatedConversation$ observable1',
            ),
            {
              extra: { payload, getConversationsFilter },
            },
          );
        }
      }),
      filter((payload) => Boolean(payload.conversationId && payload.id)),
      concatMap((payload) =>
        this.getConversationWrapper$(payload.conversationId!)
          .pipe(
            tap((conversationWrapper) =>
              conversationWrapper.onNextTravisBackendMessageDomainViewModelsConversationMessageResponseViewModel(
                payload,
              ),
            ),
          )
          .pipe(take(1)),
      ),
      // As the lastMessage needs time to be propagated to the conversationWrapper
      delay(500),
      concatMap((conversationWrapper) =>
        this.conversationMatcherService
          .matchConversationWrapper(getConversationsFilter, conversationWrapper)
          .pipe(
            map((isMatchedConversationWrapper) => ({
              conversationWrapper,
              isMatchedConversationWrapper,
            })),
          ),
      ),
      filter((tuple) => tuple.isMatchedConversationWrapper),
      map((tuple) => tuple.conversationWrapper),
    );
    const observable2 = combineLatest({
      onConversationChanged:
        this.classicRealTimeService.getOnConversationChanged$(),
      myStaff: this.userService.getMyStaff$(),
    }).pipe(
      tap(({ onConversationChanged }) => {
        if (!onConversationChanged.conversationId) {
          this.logService.critical(
            new Error(
              'received onConversationChanged with missing conversationId in getOngoingUpdatedConversation$ observable2',
            ),
            {
              extra: { onConversationChanged, getConversationsFilter },
            },
          );
        }
      }),
      filter(
        ({ onConversationChanged }) => !!onConversationChanged.conversationId,
      ),
      concatMap(({ onConversationChanged, myStaff }) => {
        return combineLatest([
          onConversationChanged.lastMessageId
            ? this.conversationMessageService
                .getMessage$(
                  onConversationChanged.conversationId!,
                  onConversationChanged.lastMessageId,
                )
                .pipe(
                  map((message) => {
                    return {
                      onConversationChanged,
                      myStaff,
                      lastMessage: message,
                    };
                  }),
                )
            : of({
                onConversationChanged,
                myStaff,
                lastMessage: null,
              }),
          this.permissionService.getIsRbacEnabled$(),
        ]);
      }),
      filter(
        ([{ onConversationChanged, myStaff, lastMessage }, isRbacEnabled]) => {
          const matcher = isRbacEnabled
            ? this.conversationMatcherService
                .matchConversationPayloadWithFilters
            : this.conversationMatcherService.matchConversation;
          return matcher(
            getConversationsFilter,
            onConversationChanged,
            myStaff,
            lastMessage,
          );
        },
      ),
      map(([{ onConversationChanged }]) => {
        return this.conversationWrapperManagerService.getOrInitConversationWrapper(
          onConversationChanged.conversationId!,
          onConversationChanged,
        );
      }),
    );

    return merge(observable1, observable2);
  }

  private readonly conversationIdToConversationReplaySubjectMap = new Map<
    string,
    ReplaySubject<TravisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel>
  >();

  public getConversation$(conversationId: string, shouldRefresh = false) {
    const refresh$ = (
      replaySubject: ReplaySubject<TravisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel>,
    ) => {
      this.conversationApi
        .conversationConversationIdGet({ conversationId })
        .pipe(RxjsUtils.getRetryAPIRequest())
        .subscribe({
          next: (
            upw: TravisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel,
          ) => {
            replaySubject.next(upw);
          },
          error: (error) => {
            replaySubject.error(error);
          },
        });
    };

    let conversationReplaySubject =
      this.conversationIdToConversationReplaySubjectMap.get(conversationId);
    if (conversationReplaySubject === undefined) {
      conversationReplaySubject =
        new ReplaySubject<TravisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel>(
          1,
        );
      this.conversationIdToConversationReplaySubjectMap.set(
        conversationId,
        conversationReplaySubject,
      );

      refresh$(conversationReplaySubject);
    } else {
      if (shouldRefresh) {
        refresh$(conversationReplaySubject);
      }
    }

    if (shouldRefresh) {
      return conversationReplaySubject.asObservable();
    }

    return conversationReplaySubject.asObservable().pipe(take(1));
  }

  public getConversationWrapper$(
    conversationId: string,
    shouldRefresh = false,
  ): Observable<ConversationWrapper> {
    if (
      conversationId === '' ||
      conversationId === ConversationWrapper.initializing().getId()
    ) {
      return of(ConversationWrapper.initializing());
    }

    const conversationWrapper =
      this.conversationWrapperManagerService.getConversationWrapper(
        conversationId,
      );

    if (shouldRefresh || conversationWrapper === undefined) {
      return this.getConversation$(conversationId, shouldRefresh).pipe(
        map(
          (
            travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel,
          ) => {
            return this.conversationWrapperManagerService.getOrInitConversationWrapper(
              conversationId,
              travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel,
            );
          },
        ),
      );
    }

    return of(conversationWrapper);
  }

  public searchUserProfilesWithConversations$(
    offset: number,
    limit: number,
    getConversationsFilter: GetConversationsFilter,
    searchKeyword: string,
  ): Observable<{
    totalNumberOfUserProfiles: number;
    searchResults: {
      conversation: ConversationWrapper;
      userProfile: UserProfileWrapper;
    }[];
  }> {
    let assignedTo = 'all';
    let teamId = undefined;
    if (getConversationsFilter.assignedStaffId !== undefined) {
      assignedTo = getConversationsFilter.assignedStaffId;
    } else if (getConversationsFilter.isMentioned === true) {
      assignedTo = 'mentioned';
    } else if (getConversationsFilter.isCollaborated === true) {
      assignedTo = 'collaborator';
    } else if (getConversationsFilter.assignedTeamId !== undefined) {
      assignedTo = 'team';
      teamId = getConversationsFilter.assignedTeamId;
    }

    return this.userProfileApi
      .v3UserProfileSearchPost({
        limit: limit,
        offset: offset,
        status: getConversationsFilter.status,
        channel: getConversationsFilter.channelType,
        channelIds: getConversationsFilter.channelIds
          ? getConversationsFilter.channelIds.join(',')
          : undefined,
        assignedTo: assignedTo,
        teamId: teamId,
        travisBackendCompanyDomainModelsCondition: [
          {
            fieldName: 'displayname',
            conditionOperator: 'Contains' as any,
            values: [searchKeyword],
            nextOperator: 'Or' as any,
          },
          {
            fieldName: 'phonenumber',
            conditionOperator: 'Contains' as any,
            values: [searchKeyword.replace(/\s/g, '').replace(/\+/g, '')],
            nextOperator: 'Or' as any,
          },
        ],
      })
      .pipe(
        map(
          (
            resp: TravisBackendConversationDomainViewModelsSearchUserConversationResponse,
          ) => {
            return {
              totalNumberOfUserProfiles: resp.totalResult!,
              searchResults: resp.conversations!.map(
                (
                  conversation: TravisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel,
                ) => {
                  return {
                    conversation:
                      this.conversationWrapperManagerService.getOrInitConversationWrapper(
                        conversation.conversationId!,
                        conversation,
                      ),
                    userProfile:
                      this.userProfileWrapperManagerService.getOrInitUserProfileWrapper3(
                        conversation.userProfile!.id!,
                        conversation,
                      ),
                  };
                },
              ),
            };
          },
        ),
      );
  }

  public searchMessageWithConversations$(
    offset: number,
    limit: number,
    getConversationsFilter: GetConversationsFilter,
    searchKeyword: string,
  ): Observable<{
    totalNumberOfConversationMessages: number;
    searchResults: {
      message: ConversationMessageWrapper;
      conversation: ConversationWrapper;

      // Possible undefined when the message was created by a deleted UserProfile
      userProfile?: UserProfileWrapper;
    }[];
  }> {
    let assignedTo = 'all';
    let teamId = undefined;
    if (getConversationsFilter.assignedStaffId !== undefined) {
      assignedTo = getConversationsFilter.assignedStaffId;
    } else if (getConversationsFilter.isMentioned === true) {
      assignedTo = 'mentioned';
    } else if (getConversationsFilter.isCollaborated === true) {
      assignedTo = 'collaborator';
    } else if (getConversationsFilter.assignedTeamId !== undefined) {
      assignedTo = 'team';
      teamId = getConversationsFilter.assignedTeamId;
    }

    const ignoreCache = shouldIgnoreSearchMessageEndpointBackendCache();

    return this.conversationApi
      .v3ConversationAssignedToSearchMessageGet({
        limit: limit,
        offset: offset,
        status: getConversationsFilter.status,
        channel: getConversationsFilter.channelType,
        channelIds: getConversationsFilter.channelIds
          ? getConversationsFilter.channelIds.join(',')
          : undefined,
        assignedTo: assignedTo,
        teamId: teamId,
        keywords: searchKeyword,
        isAllowCache: !ignoreCache,
      })
      .pipe(
        map(
          (
            resp: TravisBackendConversationDomainViewModelsConversationWithCountViewModel,
          ) => {
            return {
              totalNumberOfConversationMessages: resp.count!,
              searchResults: resp
                .data!.map(
                  (
                    conversation: TravisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel,
                  ) => {
                    return {
                      conversation:
                        this.conversationWrapperManagerService.getOrInitConversationWrapper(
                          conversation.conversationId!,
                          conversation,
                        ),
                      userProfile: conversation.userProfile
                        ? this.userProfileWrapperManagerService.getOrInitUserProfileWrapper3(
                            conversation.userProfile!.id!,
                            conversation,
                          )
                        : undefined,
                      messages: conversation.messages!.map(
                        (
                          m: TravisBackendMessageDomainViewModelsConversationMessageResponseViewModel,
                        ) => {
                          return this.conversationMessageWrapperManagerService.getOrInitConversationMessageWrapper(
                            m.id!,
                            m,
                          );
                        },
                      ),
                    };
                  },
                )
                .flatMap((tuple) => {
                  return tuple.messages.map((message) => {
                    return {
                      message,
                      conversation: tuple.conversation,
                      userProfile: tuple.userProfile,
                    };
                  });
                }),
            };
          },
        ),
      );
  }

  public getAllConversations$(
    offset: number,
    limit: number,
    orderBy: string,
    getConversationsFilter: GetConversationsFilter,
  ) {
    if (getConversationsFilter.assignedStaffId !== undefined) {
      throw new Error('assignedStaffId is blocked for getAllConversations$');
    }
    if (getConversationsFilter.assignedTeamId !== undefined) {
      throw new Error('assignedTeamId is blocked for getAllConversations$');
    }

    const myGetConversationsFilter: GetConversationsFilter = JSON.parse(
      JSON.stringify(getConversationsFilter),
    );

    myGetConversationsFilter.assignedStaffId = 'all';
    myGetConversationsFilter.isStaffAssigned =
      getConversationsFilter.isStaffAssigned;

    return this.getConversations$(
      offset,
      limit,
      orderBy,
      myGetConversationsFilter,
    );
  }

  public getMentionedConversations$(
    offset: number,
    limit: number,
    orderBy: string,
    getConversationsFilter: GetConversationsFilter,
  ) {
    if (getConversationsFilter.assignedStaffId !== undefined) {
      throw new Error('assignedStaffId is blocked for getAllConversations$');
    }
    if (getConversationsFilter.assignedTeamId !== undefined) {
      throw new Error('assignedTeamId is blocked for getAllConversations$');
    }

    const myGetConversationsFilter: GetConversationsFilter = JSON.parse(
      JSON.stringify(getConversationsFilter),
    );

    myGetConversationsFilter.assignedStaffId = 'mentioned';

    return this.getConversations$(
      offset,
      limit,
      orderBy,
      myGetConversationsFilter,
    );
  }

  public getCollaboratedConversations$(
    offset: number,
    limit: number,
    orderBy: string,
    getConversationsFilter: GetConversationsFilter,
  ) {
    if (getConversationsFilter.assignedStaffId !== undefined) {
      throw new Error(
        'assignedStaffId is blocked for getCollaborationConversations$',
      );
    }
    if (getConversationsFilter.assignedTeamId !== undefined) {
      throw new Error(
        'assignedTeamId is blocked for getCollaborationConversations$',
      );
    }

    const myGetConversationsFilter: GetConversationsFilter = JSON.parse(
      JSON.stringify(getConversationsFilter),
    );

    myGetConversationsFilter.assignedStaffId = 'collaborator';

    return this.getConversations$(
      offset,
      limit,
      orderBy,
      myGetConversationsFilter,
    );
  }

  public getTeamConversations$(
    offset: number,
    limit: number,
    orderBy: string,
    getConversationsFilter: GetConversationsFilter,
  ) {
    if (getConversationsFilter.assignedTeamId === undefined) {
      throw new Error('assignedTeamId is required for getTeamConversations$');
    }

    const myGetConversationsFilter: GetConversationsFilter = JSON.parse(
      JSON.stringify(getConversationsFilter),
    );

    if (getConversationsFilter.assignedStaffId === undefined) {
      myGetConversationsFilter.assignedStaffId = 'team';
    }

    return this.getConversations$(
      offset,
      limit,
      orderBy,
      myGetConversationsFilter,
    );
  }

  public getStaffConversations$(
    offset: number,
    limit: number,
    orderBy: string,
    getConversationsFilter: GetConversationsFilter,
  ) {
    if (getConversationsFilter.assignedStaffId === undefined) {
      throw new Error('assignedStaffId is required for getStaffConversations$');
    }
    if (getConversationsFilter.assignedTeamId !== undefined) {
      throw new Error('assignedTeamId is blocked for getStaffConversations$');
    }

    const myGetConversationsFilter: GetConversationsFilter = JSON.parse(
      JSON.stringify(getConversationsFilter),
    );

    return this.getConversations$(
      offset,
      limit,
      orderBy,
      myGetConversationsFilter,
    );
  }

  private getConversations$(
    offset: number,
    limit: number,
    orderBy: string,
    getConversationsFilter: GetConversationsFilter,
  ): Observable<
    {
      conversation: ConversationWrapper;
      userProfile: UserProfileWrapper;
      lastMessage?: ConversationMessageWrapper;
    }[]
  > {
    const hasLabelFilter = Boolean(getConversationsFilter.labelIds?.length);

    return combineLatest({
      getConversationsFilter: of(getConversationsFilter).pipe(take(1)),
      labels: hasLabelFilter
        ? this.labelService.getAllLabels$().pipe(
            map((labels) => {
              const labelIds = getConversationsFilter.labelIds!;
              return labels
                .filter((l) => labelIds.includes(l.id))
                .map((l) => l.hashtag);
            }),
            take(1),
          )
        : of(undefined),
      myStaff: this.userService.getMyStaff$().pipe(take(1)),
    }).pipe(
      take(1),
      switchMap(({ getConversationsFilter, labels, myStaff }) => {
        return this.conversationApi
          .v3ConversationsAssignedToGet({
            assignedTo: getConversationsFilter.assignedStaffId!,
            offset: offset,
            limit: limit,
            status: getConversationsFilter.status,
            channel: getConversationsFilter.channelType,
            afterUpdatedAt: undefined,
            afterModifiedAt: undefined,
            channelIds:
              getConversationsFilter.channelIds === undefined
                ? undefined
                : getConversationsFilter.channelIds.join(','),
            tags: labels === undefined ? undefined : labels.join(','),
            teamId: getConversationsFilter.assignedTeamId,
            isTeamUnassigned: undefined,
            isUnread: getConversationsFilter.isUnread,
            orderBy,
            isAssigned: getConversationsFilter.isStaffAssigned,
            // Intended to be undefined as the BE doesn't handle both assignedTo = 'collaborator' && isCollaborator = true
            isCollaborator: undefined,
            behaviourVersion: GetConversationBehaviorVersion(
              getConversationsFilter,
              myStaff.id,
            ),
          })
          .pipe(
            map(
              (
                getConversationsResponse: TravisBackendConversationDomainViewModelsConversationWithCountViewModel,
              ) => {
                if (
                  getConversationsResponse.data === undefined ||
                  getConversationsResponse.data === null
                ) {
                  throw new Error(
                    'getConversationsResponse.data is undefined or null',
                  );
                }

                return getConversationsResponse.data.map(
                  (
                    conversation: TravisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel,
                  ) => {
                    return {
                      conversation:
                        this.conversationWrapperManagerService.getOrInitConversationWrapper(
                          conversation.conversationId!,
                          conversation,
                        ),
                      userProfile: conversation.userProfile
                        ? this.userProfileWrapperManagerService.getOrInitUserProfileWrapper3(
                            conversation.userProfile!.id!,
                            conversation,
                          )
                        : UserProfileWrapper.initializing(),
                      lastMessage:
                        conversation.lastMessage === undefined ||
                        conversation.lastMessage === null ||
                        conversation.lastMessage.length === 0
                          ? undefined
                          : this.conversationMessageWrapperManagerService.getOrInitConversationMessageWrapper(
                              conversation.lastMessage![0].id!,
                              conversation.lastMessage![0],
                            ),
                    };
                  },
                );
              },
            ),
          );
      }),
    );
  }

  public onReadConversation = new Subject<{ id: string }>();

  public getOnReadConversation$() {
    return this.onReadConversation.asObservable();
  }

  public onConversationTyping(conversationId: string) {
    return this.userService.getMyUserId$().pipe(
      take(1),
      switchMap((staffId) =>
        this.conversationApi
          .conversationTypingPost({
            travisBackendMessageDomainViewModelsConversationTypingObject: {
              conversationId,
              staffId,
            },
          })
          .pipe(take(1), RxjsUtils.getRetryAPIRequest()),
      ),
    );
  }
}
