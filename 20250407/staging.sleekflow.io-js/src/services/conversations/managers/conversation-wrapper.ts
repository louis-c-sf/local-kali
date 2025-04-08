import {
  ConversationApi,
  TravisBackendConversationDomainViewModelsConversationAssignResponseViewModel,
  TravisBackendConversationDomainViewModelsConversationMetadataChannelResponseViewModel,
  TravisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel,
  TravisBackendConversationDomainViewModelsConversationStatusResponseViewModel,
  TravisBackendConversationDomainViewModelsStaffConversationPermission as ConversationPermissions,
  TravisBackendConversationDomainViewModelsStaffWithoutCompanyResponse,
  TravisBackendConversationDomainViewModelsUserProfileNoCompanyResponse,
  TravisBackendMessageDomainViewModelsConversationMessageResponseViewModel,
} from '@sleekflow/sleekflow-core-typescript-rxjs-apis';
import { formatISO } from 'date-fns';
import {
  BehaviorSubject,
  catchError,
  distinctUntilChanged,
  EMPTY,
  exhaustMap,
  filter,
  map,
  Observable,
  of,
  ReplaySubject,
  shareReplay,
  Subject,
  take,
  tap,
} from 'rxjs';
import _isEqual from 'lodash/isEqual';

import { ConversationMessageWrapper } from '@/services/conversation-messages/managers/conversation-message-wrapper';
import { ConversationMessageWrapperManagerService } from '@/services/conversation-messages/managers/conversation-message-wrapper-manager.service';
import { I18nService } from '@/services/i18n/i18n.service';
import { RxjsUtils } from '@/services/rxjs-utils/rxjs-utils';
import { UserProfileWrapper } from '@/services/user-profiles/managers/user-profile-wrapper';
import { getFullName } from '@/utils/formatting';

import { DisposableDataSource } from '../../data-sources/disposable-data-source';
import { Wrapper } from '../../models/wrapper';
import type { ConversationWrapperUpdate } from './conversation-wrapper-manager.service';

export interface ConversationWrapperAssignee {
  id: string;
  staffId: number;
  firstName: string;
  lastName: string;
  email: string;
  displayName: string;
}

export interface ConversationWrapperAssignedTeam {
  id: number;
  teamName: string;
  members?:
    | TravisBackendConversationDomainViewModelsStaffWithoutCompanyResponse[]
    | null;
}

export interface ConversationWrapperLabel {
  id: string;
  name: string;
  color: string;
  type: string;
}

export interface ConversationWrapperConstructorParams {
  travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel?: TravisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel;
  travisBackendConversationDomainViewModelsUserProfileNoCompanyResponse?: TravisBackendConversationDomainViewModelsUserProfileNoCompanyResponse;
}

export type ConversationWrapperCloudAPIMetadata = Omit<
  TravisBackendConversationDomainViewModelsConversationMetadataChannelResponseViewModel,
  'channel_metadata'
> & {
  channel_metadata: {
    conversation: {
      expiration_timestamp: number;
      id: string;
      origin: {
        type:
          | 'utility'
          | 'marketing'
          | 'referral_conversion'
          | 'service'
          | 'authentication';
      };
    };
  };
};

export type ConversationWrapperMetadata = {
  whatsappcloudapi?: ConversationWrapperCloudAPIMetadata[] | null;
};

export class ConversationWrapper implements Wrapper {
  private readonly conversationWrapperUpdate$$: Subject<ConversationWrapperUpdate>;
  private readonly i18nService: I18nService;
  private readonly conversationMessageWrapperManagerService?: ConversationMessageWrapperManagerService;
  private readonly conversationApi?: ConversationApi;
  private readonly id: string;
  private readonly companyId: string;
  private readonly userProfileId: string;
  private lastMessageCreatedAtSnapshot = formatISO(new Date(+0));
  private isPinnedSnapshot = false;
  private readonly lastMessageId$$ = new BehaviorSubject<
    ConversationMessageWrapper['id']
  >(1);
  private readonly status$$ = new ReplaySubject<string>(1);
  private readonly assignee$$ =
    new BehaviorSubject<ConversationWrapperAssignee | null>(null);
  private readonly updateConversationWrapperTrigger$$ = new Subject<void>();
  private readonly labels$$ = new BehaviorSubject<
    ConversationWrapperLabel[] | null
  >(null);
  private readonly unreadMessageCount$$ = new ReplaySubject<number>(1);
  private readonly isPinned$$ = new ReplaySubject<boolean>(1);
  private readonly collaborators$$ = new BehaviorSubject<
    ConversationWrapperAssignee[] | undefined
  >(undefined);
  private readonly metadata$$ =
    new BehaviorSubject<ConversationWrapperMetadata>({});
  private readonly assignedTeam$$ =
    new BehaviorSubject<ConversationWrapperAssignedTeam | null>(null);
  private readonly lastIncomingMessagingChannelType$$ = new BehaviorSubject<
    string | null
  >('');

  private readonly snoozeuntil$$ = new ReplaySubject<string | null | undefined>(
    1,
  );

  private readonly lastIncomingMessagingChannelIdentityId$$ =
    new BehaviorSubject<string | null>('');

  private readonly updatedTime$$ = new BehaviorSubject<string>('');
  private readonly modifiedAt$$ = new BehaviorSubject<string>('');
  private collaboratorsLocallyModifiedAt = '';

  private readonly permissions$$ = new BehaviorSubject<
    ConversationPermissions | undefined
  >(undefined);

  constructor({
    conversationWrapperConstructorParams,
    conversationWrapperUpdate$$,
    //TODO: cannot use conversation service because of circular dependency perhaps move some of the conversation wrapper logic out of the service
    conversationApi,
    conversationMessageWrapperManagerService,
    i18nService,
  }: {
    conversationWrapperConstructorParams: ConversationWrapperConstructorParams;
    conversationWrapperUpdate$$: Subject<ConversationWrapperUpdate>;
    conversationMessageWrapperManagerService?: ConversationMessageWrapperManagerService;
    conversationApi?: ConversationApi;
    i18nService: I18nService;
  }) {
    this.i18nService = i18nService;
    this.conversationWrapperUpdate$$ = conversationWrapperUpdate$$;
    this.conversationApi = conversationApi;
    this.conversationMessageWrapperManagerService =
      conversationMessageWrapperManagerService;
    // this updates incomplete data from conversation wrapper
    this.updateConversationWrapperTrigger$$
      .pipe(
        // ignore new values if request is in flight already
        exhaustMap(() => {
          if (this.conversationApi) {
            return this.conversationApi
              .conversationConversationIdGet({
                conversationId: this.id,
              })
              .pipe(RxjsUtils.getRetryAPIRequest());
          }
          return of(undefined);
        }),
        catchError(() => {
          return EMPTY;
        }),
      )
      .subscribe((v) => {
        if (!v) {
          return;
        }
        this.onNextTravisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel(
          v,
        );
      });

    if (
      conversationWrapperConstructorParams.travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel
    ) {
      const travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel =
        conversationWrapperConstructorParams.travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel;

      if (
        !travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel.conversationId
      ) {
        throw new Error('conversationId is required');
      }
      if (
        !travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel.companyId
      ) {
        throw new Error('companyId is required');
      }

      this.id =
        travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel.conversationId;
      this.companyId =
        travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel.companyId;
      this.userProfileId =
        travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel
          .userProfile?.id || UserProfileWrapper.initializing().getId();

      this.onNextTravisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel(
        travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel,
      );
    } else {
      throw new Error();
    }
  }

  public onNextConversationPermissions(
    permissions:
      | ConversationPermissions
      | ((previous?: ConversationPermissions) => ConversationPermissions),
  ) {
    const currentValue = this.permissions$$.getValue();
    const resolved =
      typeof permissions === 'function'
        ? permissions(currentValue)
        : permissions;

    if (_isEqual(currentValue, resolved)) {
      return;
    }

    this.permissions$$.next(resolved);
    this.conversationWrapperUpdate$$.next({
      id: this.id,
      type: 'permissions',
      newValue: {
        permissions: resolved,
      },
    });
  }

  public onNextTravisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel(
    travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel: TravisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel,
  ) {
    if (
      !travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel.conversationId
    ) {
      throw new Error('conversationId is required');
    }
    if (
      !travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel.companyId
    ) {
      throw new Error('companyId is required');
    }

    // About conversation.updatedTime vs conversation.modifiedAt:
    // - updatedTime is more like "last messaged at", other property updates won't touch this timestamp
    // - modifiedAt is the last time the conversation was updated except for messages, user profile
    // :)
    const { updatedTime, modifiedAt } =
      travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel;

    const prevUpdatedTime = this.getUpdatedTime();
    if (updatedTime && updatedTime > prevUpdatedTime) {
      this.updatedTime$$.next(updatedTime);
      this.conversationWrapperUpdate$$.next({
        id: this.id,
        type: 'updatedTime',
        newValue: {
          updatedTime,
        },
      });
    }

    // Some endpoints caches conversations 👿, so we should check isLatestModifiedAt to see if we need to update
    const prevModifiedAt = this.getModifiedAt();
    const isLatestModifiedAt = modifiedAt && modifiedAt > prevModifiedAt;
    if (isLatestModifiedAt) {
      this.modifiedAt$$.next(modifiedAt);
      this.conversationWrapperUpdate$$.next({
        id: this.id,
        type: 'modifiedAt',
        newValue: {
          modifiedAt,
        },
      });
    }

    if (
      travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel
        .lastMessage?.length
    ) {
      if (this.conversationMessageWrapperManagerService) {
        const lastMessage =
          this.conversationMessageWrapperManagerService.getOrInitConversationMessageWrapper(
            travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel
              .lastMessage[0].id!,
            travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel
              .lastMessage[0],
          );

        this.onNextNewLastMessage(lastMessage);
      }
    }

    if (
      travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel.metadata
    ) {
      this.metadata$$.next(
        travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel.metadata! as ConversationWrapperMetadata,
      );
    }

    if (
      isLatestModifiedAt &&
      travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel.status !==
        undefined &&
      travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel.status !==
        null
    ) {
      const newStatus =
        travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel.status;

      this.status$$.next(newStatus);
      this.conversationWrapperUpdate$$.next({
        id: this.id,
        type: 'status',
        newValue: {
          status: newStatus,
        },
      });
    }

    if (isLatestModifiedAt) {
      if (
        travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel.assignee !==
          undefined &&
        travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel.assignee !==
          null
      ) {
        const assigneeViewModel =
          travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel.assignee;

        const newAssignee =
          this.transformTravisBackendConversationDomainViewModelsStaffWithoutCompanyResponseToConverswationWrapperAssignee(
            assigneeViewModel,
          );
        this.assignee$$.next(newAssignee);
        this.conversationWrapperUpdate$$.next({
          id: this.id,
          type: 'assignee',
          newValue: {
            assignee: newAssignee,
          },
        });
      } else {
        this.assignee$$.next(null);
        this.conversationWrapperUpdate$$.next({
          id: this.id,
          type: 'assignee',
          newValue: {
            assignee: null,
          },
        });
      }
    }

    if (
      travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel.conversationHashtags !==
        undefined &&
      travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel.conversationHashtags !==
        null
    ) {
      const labels: ConversationWrapperLabel[] =
        travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel.conversationHashtags.map(
          (tag) => {
            return {
              id: tag.id!,
              name: tag.hashtag!,
              color: tag.hashTagColor!,
              type: tag.hashTagType!,
            };
          },
        );
      this.labels$$.next(labels);
      this.conversationWrapperUpdate$$.next({
        id: this.id,
        type: 'labels',
        newValue: {
          labels: labels,
        },
      });
    } else {
      this.labels$$.next([]);
      this.conversationWrapperUpdate$$.next({
        id: this.id,
        type: 'labels',
        newValue: {
          labels: [],
        },
      });
    }

    if (
      travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel.unreadMessageCount !==
        undefined &&
      travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel.unreadMessageCount !==
        null
    ) {
      this.unreadMessageCount$$.next(
        travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel.unreadMessageCount,
      );
      this.conversationWrapperUpdate$$.next({
        id: this.id,
        type: 'unreadMessageCount',
        newValue: {
          unreadMessageCount:
            travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel.unreadMessageCount,
        },
      });
    }

    if (
      travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel.isBookmarked !==
        undefined &&
      travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel.isBookmarked !==
        null
    ) {
      this.isPinned$$.next(
        travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel.isBookmarked,
      );
      this.isPinnedSnapshot =
        travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel.isBookmarked;

      this.conversationWrapperUpdate$$.next({
        id: this.id,
        type: 'isPinned',
        newValue: {
          isPinned:
            travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel.isBookmarked,
        },
      });

      this.snoozeuntil$$.next(
        travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel.snoozeUntil,
      );
    }

    if (
      isLatestModifiedAt &&
      modifiedAt >= this.collaboratorsLocallyModifiedAt && // Only overwrite if event's collaborators are newer than FE's optimistic changes on collaborators
      travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel.additionalAssignees !==
        undefined &&
      travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel.additionalAssignees !==
        null
    ) {
      const collaborators =
        travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel.additionalAssignees.map(
          (
            travisBackendConversationDomainViewModelsAdditionalAssigneeResponse,
          ) => {
            return this.transformTravisBackendConversationDomainViewModelsStaffWithoutCompanyResponseToConverswationWrapperAssignee(
              travisBackendConversationDomainViewModelsAdditionalAssigneeResponse.assignee!,
            );
          },
        );

      this.setCollaborators(collaborators);
    }

    if (isLatestModifiedAt) {
      if (
        travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel.assignedTeam !==
          undefined &&
        travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel.assignedTeam !==
          null
      ) {
        const assignedTeamViewModel =
          travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel.assignedTeam;
        const assignedTeam = {
          id: assignedTeamViewModel.id!,
          teamName: assignedTeamViewModel.teamName!,
          members: assignedTeamViewModel.members,
        };

        this.assignedTeam$$.next(assignedTeam);
        this.conversationWrapperUpdate$$.next({
          id: this.id,
          type: 'assignedTeam',
          newValue: {
            assignedTeam: assignedTeam,
          },
        });
      } else {
        this.assignedTeam$$.next(null);
        this.conversationWrapperUpdate$$.next({
          id: this.id,
          type: 'assignedTeam',
          newValue: {
            assignedTeam: null,
          },
        });
      }
    }

    if (
      travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel.lastMessageChannel !==
        undefined &&
      travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel.lastMessageChannel !==
        null
    ) {
      this.lastIncomingMessagingChannelType$$.next(
        travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel.lastMessageChannel,
      );
      this.conversationWrapperUpdate$$.next({
        id: this.id,
        type: 'lastIncomingMessagingChannelType',
        newValue: {
          lastIncomingMessagingChannelType:
            travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel.lastMessageChannel,
        },
      });
    }

    if (
      travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel.lastChannelIdentityId
    ) {
      this.lastIncomingMessagingChannelIdentityId$$.next(
        travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel.lastChannelIdentityId,
      );

      this.conversationWrapperUpdate$$.next({
        id: this.id,
        type: 'lastIncomingMessagingChannelIdentityId',
        newValue: {
          lastIncomingMessagingChannelIdentityId:
            travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel.lastChannelIdentityId,
        },
      });
    }

    if (
      isLatestModifiedAt &&
      travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel.staffConversationPermission
    ) {
      this.onNextConversationPermissions(
        travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel.staffConversationPermission,
      );
    }
  }

  public onNextTravisBackendMessageDomainViewModelsConversationMessageResponseViewModel(
    travisBackendMessageDomainViewModelsConversationMessageResponseViewModel: TravisBackendMessageDomainViewModelsConversationMessageResponseViewModel,
  ) {
    if (
      travisBackendMessageDomainViewModelsConversationMessageResponseViewModel.conversationId !==
      this.id
    ) {
      throw new Error(
        `conversationId must match, received ${travisBackendMessageDomainViewModelsConversationMessageResponseViewModel.conversationId} but expected ${this.id}`,
      );
    }

    this.lastMessageId$$.pipe(take(1)).subscribe((lastMessageId) => {
      const lastMessage =
        this.conversationMessageWrapperManagerService?.getConversationMessageWrapper(
          lastMessageId,
        );

      if (
        lastMessage &&
        travisBackendMessageDomainViewModelsConversationMessageResponseViewModel.createdAt! <=
          lastMessage.getCreatedAt()
      ) {
        // The message is older than the last message we have.
        return;
      }

      if (this.conversationMessageWrapperManagerService) {
        const newLastMessage =
          this.conversationMessageWrapperManagerService.getOrInitConversationMessageWrapper(
            travisBackendMessageDomainViewModelsConversationMessageResponseViewModel.id!,
            travisBackendMessageDomainViewModelsConversationMessageResponseViewModel,
          );

        this.onNextNewLastMessage(newLastMessage, { checkMentioned: true });
      }
    });
  }

  private onNextNewLastMessage(
    newLastMessage: ConversationMessageWrapper,
    { checkMentioned }: { checkMentioned?: boolean } = {},
  ) {
    if (newLastMessage.getMessageType() === 'system') {
      // System Message is not count as a last message
      return;
    }

    this.lastMessageId$$.next(newLastMessage.getId());
    this.lastMessageCreatedAtSnapshot = newLastMessage.getCreatedAt();

    this.conversationWrapperUpdate$$.next({
      id: this.id,
      type: 'lastMessage',
      newValue: {
        lastMessage: newLastMessage,
      },
    });

    const createdAt = newLastMessage.getCreatedAt();
    const prevUpdatedTime = this.getUpdatedTime();
    if (createdAt && createdAt > prevUpdatedTime) {
      this.updatedTime$$.next(createdAt);
      this.conversationWrapperUpdate$$.next({
        id: this.id,
        type: 'updatedTime',
        newValue: {
          updatedTime: createdAt,
        },
      });
    }

    // When there is a note message, we need to retrieve from the metadata
    // getLastConversationIncomingMessageChannel and getLastConversationIncomingChannelIdentityId
    // are from the metadata
    if (newLastMessage.getChannelType() === 'note') {
      this.lastIncomingMessagingChannelType$$.next(
        newLastMessage.getLastConversationIncomingMessageChannel() || null,
      );
      this.conversationWrapperUpdate$$.next({
        id: this.id,
        type: 'lastIncomingMessagingChannelType',
        newValue: {
          lastIncomingMessagingChannelType:
            newLastMessage.getLastConversationIncomingMessageChannel() || null,
        },
      });

      this.lastIncomingMessagingChannelIdentityId$$.next(
        newLastMessage.getLastConversationIncomingChannelIdentityId() || null,
      );
      this.conversationWrapperUpdate$$.next({
        id: this.id,
        type: 'lastIncomingMessagingChannelIdentityId',
        newValue: {
          lastIncomingMessagingChannelIdentityId:
            newLastMessage.getLastConversationIncomingChannelIdentityId() ||
            null,
        },
      });

      if (checkMentioned) {
        const { staffIdentityId } = this.getPermissions() || {};
        const isMentioned =
          newLastMessage.getMessageAssignee()?.userInfo?.id === staffIdentityId;
        if (isMentioned) {
          this.onNextConversationPermissions((prev) => ({
            ...prev,
            inboxView: {
              ...prev?.inboxView,
              mentions: true,
            },
          }));
        }
      }

      return;
    }

    // When it is not a note message, we can use the channelType and channelIdentityId to update directly
    if (newLastMessage.getDirection() === 'incoming') {
      this.lastIncomingMessagingChannelType$$.next(
        newLastMessage.getChannelType(),
      );
      this.conversationWrapperUpdate$$.next({
        id: this.id,
        type: 'lastIncomingMessagingChannelType',
        newValue: {
          lastIncomingMessagingChannelType: newLastMessage.getChannelType(),
        },
      });

      const channelIdentityId = newLastMessage.getChannelIdentityId() || null;
      this.lastIncomingMessagingChannelIdentityId$$.next(channelIdentityId);
      this.conversationWrapperUpdate$$.next({
        id: this.id,
        type: 'lastIncomingMessagingChannelIdentityId',
        newValue: {
          lastIncomingMessagingChannelIdentityId: channelIdentityId,
        },
      });
    }
  }

  public onNextTravisBackendMessageDomainViewModelsConversationMessageResponseViewModelOnMessageReceived(
    travisBackendMessageDomainViewModelsConversationMessageResponseViewModel: TravisBackendMessageDomainViewModelsConversationMessageResponseViewModel,
  ) {
    if (
      travisBackendMessageDomainViewModelsConversationMessageResponseViewModel.conversationId !==
      this.id
    ) {
      throw new Error(
        `conversationId must match, received ${travisBackendMessageDomainViewModelsConversationMessageResponseViewModel.conversationId} but expected ${this.id}`,
      );
    }

    if (
      travisBackendMessageDomainViewModelsConversationMessageResponseViewModel.isSentFromSleekflow ===
      false
    ) {
      this.unreadMessageCount$$
        .pipe(take(1))
        .subscribe((unreadMessageCount) => {
          this.unreadMessageCount$$.next(unreadMessageCount + 1);
          this.conversationWrapperUpdate$$.next({
            id: this.id,
            type: 'unreadMessageCount',
            newValue: {
              unreadMessageCount: unreadMessageCount + 1,
            },
          });
        });
    }

    const { createdAt } =
      travisBackendMessageDomainViewModelsConversationMessageResponseViewModel;

    const prevUpdatedTime = this.getUpdatedTime();
    if (createdAt && createdAt > prevUpdatedTime) {
      this.updatedTime$$.next(createdAt);
      this.conversationWrapperUpdate$$.next({
        id: this.id,
        type: 'updatedTime',
        newValue: {
          updatedTime: createdAt,
        },
      });
    }
  }

  public resetUnreadMessageCount() {
    this.unreadMessageCount$$.next(0);
    this.conversationWrapperUpdate$$.next({
      id: this.id,
      type: 'unreadMessageCount',
      newValue: {
        unreadMessageCount: 0,
      },
    });
  }

  public onNextTravisBackendConversationDomainViewModelsConversationStatusResponseViewModel(
    travisBackendConversationDomainViewModelsConversationStatusResponseViewModel: TravisBackendConversationDomainViewModelsConversationStatusResponseViewModel,
  ) {
    if (
      travisBackendConversationDomainViewModelsConversationStatusResponseViewModel.conversationId !==
      this.id
    ) {
      throw new Error(
        `conversationId must match, received ${travisBackendConversationDomainViewModelsConversationStatusResponseViewModel.conversationId} but expected ${this.id}`,
      );
    }

    if (
      travisBackendConversationDomainViewModelsConversationStatusResponseViewModel.status
    ) {
      this.status$$.next(
        travisBackendConversationDomainViewModelsConversationStatusResponseViewModel.status,
      );
      this.conversationWrapperUpdate$$.next({
        id: this.id,
        type: 'status',
        newValue: {
          status:
            travisBackendConversationDomainViewModelsConversationStatusResponseViewModel.status,
        },
      });
    }

    if (
      travisBackendConversationDomainViewModelsConversationStatusResponseViewModel.isBookmarked
    ) {
      this.isPinned$$.next(
        travisBackendConversationDomainViewModelsConversationStatusResponseViewModel.isBookmarked,
      );
      this.isPinnedSnapshot =
        travisBackendConversationDomainViewModelsConversationStatusResponseViewModel.isBookmarked;
      this.conversationWrapperUpdate$$.next({
        id: this.id,
        type: 'isPinned',
        newValue: {
          isPinned:
            travisBackendConversationDomainViewModelsConversationStatusResponseViewModel.isBookmarked,
        },
      });
      this.snoozeuntil$$.next(
        travisBackendConversationDomainViewModelsConversationStatusResponseViewModel.snoozeUntil,
      );
    }
  }

  public onNextTravisBackendConversationDomainViewModelsConversationAssignResponseViewModel(
    travisBackendConversationDomainViewModelsConversationAssignResponseViewModel: TravisBackendConversationDomainViewModelsConversationAssignResponseViewModel,
  ) {
    if (
      travisBackendConversationDomainViewModelsConversationAssignResponseViewModel.status !==
        undefined &&
      travisBackendConversationDomainViewModelsConversationAssignResponseViewModel.status !==
        null
    ) {
      const newStatus =
        travisBackendConversationDomainViewModelsConversationAssignResponseViewModel.status;

      this.status$$.next(newStatus);
      this.conversationWrapperUpdate$$.next({
        id: this.id,
        type: 'status',
        newValue: {
          status: newStatus,
        },
      });
    }

    if (
      travisBackendConversationDomainViewModelsConversationAssignResponseViewModel.assignee !==
        undefined &&
      travisBackendConversationDomainViewModelsConversationAssignResponseViewModel.assignee !==
        null
    ) {
      const assigneeViewModel =
        travisBackendConversationDomainViewModelsConversationAssignResponseViewModel.assignee;

      const newAssignee =
        this.transformTravisBackendConversationDomainViewModelsStaffWithoutCompanyResponseToConverswationWrapperAssignee(
          assigneeViewModel,
        );
      this.assignee$$.next(newAssignee);
      this.conversationWrapperUpdate$$.next({
        id: this.id,
        type: 'assignee',
        newValue: {
          assignee: newAssignee,
        },
      });
    } else {
      this.assignee$$.next(null);
      this.conversationWrapperUpdate$$.next({
        id: this.id,
        type: 'assignee',
        newValue: {
          assignee: null,
        },
      });
    }

    if (
      travisBackendConversationDomainViewModelsConversationAssignResponseViewModel.additionalAssignees !==
        undefined &&
      travisBackendConversationDomainViewModelsConversationAssignResponseViewModel.additionalAssignees !==
        null
    ) {
      const collaborators =
        travisBackendConversationDomainViewModelsConversationAssignResponseViewModel.additionalAssignees.map(
          (
            travisBackendConversationDomainViewModelsAdditionalAssigneeResponse,
          ) => {
            return this.transformTravisBackendConversationDomainViewModelsStaffWithoutCompanyResponseToConverswationWrapperAssignee(
              travisBackendConversationDomainViewModelsAdditionalAssigneeResponse.assignee!,
            );
          },
        );

      this.setCollaborators(collaborators);
    }

    if (
      travisBackendConversationDomainViewModelsConversationAssignResponseViewModel.assignedTeam !==
        undefined &&
      travisBackendConversationDomainViewModelsConversationAssignResponseViewModel.assignedTeam !==
        null
    ) {
      const assignedTeamViewModel =
        travisBackendConversationDomainViewModelsConversationAssignResponseViewModel.assignedTeam;
      const assignedTeam = {
        id: assignedTeamViewModel.id!,
        teamName: assignedTeamViewModel.teamName!,
        members: assignedTeamViewModel.members,
      };

      this.assignedTeam$$.next(assignedTeam);
      this.conversationWrapperUpdate$$.next({
        id: this.id,
        type: 'assignedTeam',
        newValue: {
          assignedTeam: assignedTeam,
        },
      });
    } else {
      this.assignedTeam$$.next(null);
      this.conversationWrapperUpdate$$.next({
        id: this.id,
        type: 'assignedTeam',
        newValue: {
          assignedTeam: null,
        },
      });
    }

    if (
      travisBackendConversationDomainViewModelsConversationAssignResponseViewModel.staffConversationPermission
    ) {
      this.onNextConversationPermissions(
        travisBackendConversationDomainViewModelsConversationAssignResponseViewModel.staffConversationPermission,
      );
    }
  }

  public onNextTravisBackendConversationDomainViewModelsUserProfileNoCompanyResponse(
    travisBackendConversationDomainViewModelsUserProfileNoCompanyResponse: TravisBackendConversationDomainViewModelsUserProfileNoCompanyResponse,
  ) {
    if (
      travisBackendConversationDomainViewModelsUserProfileNoCompanyResponse.conversationHashtags !==
        undefined &&
      travisBackendConversationDomainViewModelsUserProfileNoCompanyResponse.conversationHashtags !==
        null
    ) {
      const labels: ConversationWrapperLabel[] =
        travisBackendConversationDomainViewModelsUserProfileNoCompanyResponse.conversationHashtags!.map(
          (tag) => {
            return {
              id: tag.id!,
              name: tag.hashtag!,
              color: tag.hashTagColor!,
              type: tag.hashTagType!,
            };
          },
        );
      this.labels$$.next(labels);
      this.conversationWrapperUpdate$$.next({
        id: this.id,
        type: 'labels',
        newValue: {
          labels: labels,
        },
      });
    } else {
      this.labels$$.next([]);
      this.conversationWrapperUpdate$$.next({
        id: this.id,
        type: 'labels',
        newValue: {
          labels: [],
        },
      });
    }
  }

  private setCollaborators(collaborators: ConversationWrapperAssignee[]) {
    const sorted = collaborators.sort((a, b) => {
      return a.displayName.localeCompare(b.displayName);
    });
    this.collaborators$$.next(sorted);
    this.conversationWrapperUpdate$$.next({
      id: this.id,
      type: 'collaborators',
      newValue: {
        collaborators: sorted,
      },
    });
  }

  public optimisticUpdateCollaborators(
    collaborators: ConversationWrapperAssignee[],
  ) {
    this.collaboratorsLocallyModifiedAt = new Date().toISOString();
    this.setCollaborators(collaborators);
  }

  public revertOptimisticUpdateCollaborators(
    collaborators: ConversationWrapperAssignee[],
  ) {
    this.collaboratorsLocallyModifiedAt = '';
    this.setCollaborators(collaborators);
  }

  public getUpdatedTime() {
    return this.updatedTime$$.getValue();
  }

  public getModifiedAt() {
    return this.modifiedAt$$.getValue();
  }

  public getUpdatedTime$() {
    return this.updatedTime$$.asObservable().pipe(distinctUntilChanged());
  }

  public getModifiedAt$() {
    return this.modifiedAt$$.asObservable().pipe(distinctUntilChanged());
  }

  public getMetadata$(): Observable<ConversationWrapperMetadata> {
    return this.metadata$$.asObservable();
  }

  public getId(): string {
    return this.id;
  }

  public getCompanyId(): string {
    return this.companyId;
  }

  public getUserProfileId(): string {
    return this.userProfileId;
  }

  public getLastMessageId$(): Observable<ConversationMessageWrapper['id']> {
    return this.lastMessageId$$.asObservable().pipe(
      filter((x) => x !== null && x !== undefined),
      shareReplay({
        bufferSize: 1,
        refCount: false,
      }),
    );
  }

  public getLastMessageCreatedAt(): string {
    return this.lastMessageCreatedAtSnapshot;
  }

  public getStatus$(): Observable<string> {
    return this.status$$.asObservable();
  }

  public getAssignee$(): Observable<ConversationWrapperAssignee | null> {
    return this.assignee$$.asObservable();
  }

  public getAssignee() {
    return this.assignee$$.getValue();
  }

  public getLabels$(): Observable<ConversationWrapperLabel[]> {
    return this.labels$$.asObservable().pipe(map((l) => l || []));
  }

  public getUnreadMessageCount$(): Observable<number> {
    return this.unreadMessageCount$$.asObservable();
  }

  public getIsPinned$(): Observable<boolean> {
    return this.isPinned$$.asObservable();
  }

  public getSnoozeUntil$(): Observable<string | null | undefined> {
    return this.snoozeuntil$$.asObservable();
  }

  public getIsPinned(): boolean {
    return this.isPinnedSnapshot;
  }

  public getCollaborators() {
    return this.collaborators$$.getValue();
  }

  public getCollaborators$(): Observable<ConversationWrapperAssignee[]> {
    return this.collaborators$$.pipe(
      tap((collaborators) => {
        if (!collaborators) {
          // if collaborators undefined means it is incomplete data so fire trigger to update the conversation wrapper
          this.updateConversationWrapperTrigger$$.next();
        }
      }),
      map((x) => {
        if (!x) {
          return [];
        }
        return x;
      }),
      shareReplay(1),
    );
  }

  public getAssignedTeam$(): Observable<ConversationWrapperAssignedTeam | null> {
    return this.assignedTeam$$.asObservable();
  }

  public getAssignedTeam() {
    return this.assignedTeam$$.getValue();
  }

  public transformTravisBackendConversationDomainViewModelsStaffWithoutCompanyResponseToConverswationWrapperAssignee(
    assigneeViewModel: TravisBackendConversationDomainViewModelsStaffWithoutCompanyResponse,
  ) {
    return {
      displayName:
        assigneeViewModel.userInfo?.displayName?.trim() ||
        getFullName({
          firstName: assigneeViewModel.userInfo?.firstName,
          lastName: assigneeViewModel.userInfo?.lastName,
          fallback:
            assigneeViewModel.userInfo?.email ||
            this.i18nService.t('general.unknown-label'),
        }),
      id: assigneeViewModel.userInfo!.id!,
      staffId: assigneeViewModel.staffId!,
      firstName: (assigneeViewModel.userInfo?.firstName || '').trim(),
      lastName: (assigneeViewModel.userInfo?.lastName || '').trim(),
      email: assigneeViewModel.userInfo?.email || '',
    };
  }

  public getLastIncomingMessagingChannelType$(): Observable<string | null> {
    return this.lastIncomingMessagingChannelType$$.asObservable();
  }

  public getLastIncomingMessagingChannelIdentityId$(): Observable<
    string | null
  > {
    return this.lastIncomingMessagingChannelIdentityId$$.asObservable();
  }

  public getPermissions$() {
    return this.permissions$$.asObservable();
  }

  public getPermissions() {
    return this.permissions$$.getValue();
  }

  destroy() {
    this.lastMessageId$$.complete();
    this.status$$.complete();
    this.assignee$$.complete();
    this.labels$$.complete();
    this.unreadMessageCount$$.complete();
    this.isPinned$$.complete();
    this.collaborators$$.complete();
    this.assignedTeam$$.complete();
    this.lastIncomingMessagingChannelType$$.complete();
    this.lastIncomingMessagingChannelIdentityId$$.complete();
    this.snoozeuntil$$.complete();
    this.updatedTime$$.complete();
    this.modifiedAt$$.complete();
  }

  private subscribingDataSources: DisposableDataSource[] = [];

  subscribe(disposableDataSource: DisposableDataSource): void {
    this.subscribingDataSources = [
      ...new Set([...this.subscribingDataSources, disposableDataSource]),
    ];
  }

  unsubscribe(disposableDataSource: DisposableDataSource): void {
    this.subscribingDataSources = this.subscribingDataSources.filter((d) => {
      return d !== disposableDataSource;
    });
  }

  observed() {
    this.subscribingDataSources = this.subscribingDataSources.filter((d) => {
      return !d.disconnected();
    });

    return (
      this.lastMessageId$$.observed ||
      this.status$$.observed ||
      this.assignee$$.observed ||
      this.labels$$.observed ||
      this.unreadMessageCount$$.observed ||
      this.isPinned$$.observed ||
      this.collaborators$$.observed ||
      this.assignedTeam$$.observed ||
      this.lastIncomingMessagingChannelType$$.observed ||
      this.subscribingDataSources.length !== 0 ||
      this.snoozeuntil$$.observed ||
      this.updatedTime$$.observed ||
      this.modifiedAt$$.observed
    );
  }

  getIsInitializing() {
    return ConversationWrapper.initializing().getId() === this.getId();
  }

  private static loading = new ConversationWrapper({
    conversationWrapperConstructorParams: {
      travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel:
        {
          conversationId: 'conv123',
          companyId: 'comp456',
          conversationChannels: [],
          messageGroupName: '',
          userProfile: {
            id: UserProfileWrapper.initializing().getId(),
            firstName: '...',
            lastName: '...',
            pictureUrl: '',
            createdAt: formatISO(new Date(+0)),
            updatedAt: formatISO(new Date(+0)),
            // ...other properties would be defined here...
          },
          status: 'active',
          assignee: undefined,
          additionalAssignees: [
            // ...array of TravisBackendConversationDomainViewModelsAdditionalAssigneeResponse...
          ],
          conversationHashtags: [
            // ...array of TravisBackendMessageDomainViewModelsConversationHashtagResponse...
          ],
          lastMessage: [
            // ...array of TravisBackendMessageDomainViewModelsConversationMessageResponse...
          ],
          messages: [
            // ...array of TravisBackendMessageDomainViewModelsConversationMessageResponse...
          ],
          updatedTime: '2024-01-18T12:01:00Z',
          modifiedAt: '2024-01-18T12:01:00Z',
          unreadMessageCount: 0,
          snoozeUntil: null,
          firstMessageId: 12345,
          lastMessageId: 12349,
          lastMessageChannel: 'email',
          assignedTeam: undefined,
          isSandbox: false,
          isBookmarked: true,
          metadata: undefined,
        },
    },
    i18nService: new I18nService(),
    conversationWrapperUpdate$$: new Subject<ConversationWrapperUpdate>(),
  });

  public static initializing() {
    return this.loading;
  }
}
