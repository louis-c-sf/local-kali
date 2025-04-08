import {
  ConversationApi,
  TravisBackendConversationDomainViewModelsConversationAssignResponseViewModel,
  TravisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel,
  TravisBackendConversationDomainViewModelsConversationStatusResponseViewModel,
  TravisBackendConversationDomainViewModelsStaffConversationPermission,
} from '@sleekflow/sleekflow-core-typescript-rxjs-apis';
import { inject, injectable } from 'inversify';
import { interval, merge, Observable, Subject } from 'rxjs';

import { conversationKeys } from '@/api/conversation/queryKeys';
import { ConversationMessageWrapper } from '@/services/conversation-messages/managers/conversation-message-wrapper';
import { ConversationMessageWrapperManagerService } from '@/services/conversation-messages/managers/conversation-message-wrapper-manager.service';
import { SendingConversationMessageManager } from '@/services/conversation-messages/managers/sending-conversation-message-manager';
import { I18nService } from '@/services/i18n/i18n.service';
import { queryClient } from '@/utils/queryClient';

import { ClassicRealTimeService } from '../../signal-r/classic-real-time.service';
import {
  ConversationWrapper,
  ConversationWrapperAssignedTeam,
  ConversationWrapperAssignee,
  ConversationWrapperLabel,
} from './conversation-wrapper';

export interface ConversationWrapperUpdate {
  id: string;
  type:
    | 'lastMessage'
    | 'assignee'
    | 'status'
    | 'labels'
    | 'unreadMessageCount'
    | 'isPinned'
    | 'collaborators'
    | 'assignedTeam'
    | 'lastIncomingMessagingChannelType'
    | 'lastIncomingMessagingChannelIdentityId'
    | 'permissions'
    | 'updatedTime'
    | 'modifiedAt';
  newValue: {
    lastMessage?: ConversationMessageWrapper;
    assignee?: ConversationWrapperAssignee | null;
    status?: string;
    labels?: ConversationWrapperLabel[];
    unreadMessageCount?: number;
    isPinned?: boolean;
    collaborators?: ConversationWrapperAssignee[];
    assignedTeam?: ConversationWrapperAssignedTeam | null;
    lastIncomingMessagingChannelType?: string | null;
    lastIncomingMessagingChannelIdentityId?: string | null;
    updatedTime?: string;
    modifiedAt?: string;
    permissions?: TravisBackendConversationDomainViewModelsStaffConversationPermission;
  };
}

@injectable()
export class ConversationWrapperManagerService {
  private conversationIdToConversationWrapperMap = new Map<
    string,
    {
      conversationWrapper: ConversationWrapper;
      lastObservedAt: number;
    }
  >();
  private conversationWrapperUpdate$$ =
    new Subject<ConversationWrapperUpdate>();

  constructor(
    @inject(I18nService) private i18nService: I18nService,
    @inject(ConversationApi)
    private conversationApi: ConversationApi,
    @inject(ClassicRealTimeService)
    private classicRealTimeService: ClassicRealTimeService,
    @inject(ConversationMessageWrapperManagerService)
    private conversationMessageWrapperManagerService: ConversationMessageWrapperManagerService,
    @inject(SendingConversationMessageManager)
    private sendingConversationMessageManager: SendingConversationMessageManager,
  ) {
    this.classicRealTimeService
      .getOnConversationChanged$()
      .subscribe(
        (
          x: TravisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel,
        ) => {
          if (x.conversationId === undefined || x.conversationId === null) {
            return;
          }

          const conversationWrapper = this.getConversationWrapper(
            x.conversationId,
          );
          if (conversationWrapper === undefined) {
            return;
          }

          if (x.staffConversationPermission) {
            queryClient.setQueryData(
              conversationKeys.isConversationAccessibleKey({
                conversationId: x.conversationId,
              }),
              () => ({
                isAccessible: x.staffConversationPermission?.canView,
                ...x.staffConversationPermission,
              }),
            );
          } else {
            queryClient.invalidateQueries({
              queryKey: conversationKeys.isConversationAccessibleKey({
                conversationId: x.conversationId,
              }),
            });
          }

          conversationWrapper.onNextTravisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel(
            x,
          );
        },
      );

    merge(
      this.classicRealTimeService.getOnConversationMessageChanged$(),
      this.sendingConversationMessageManager.getSentMessage$(),
    ).subscribe((x) => {
      if (x.conversationId === undefined || x.conversationId === null) {
        return;
      }

      const conversationWrapper = this.getConversationWrapper(x.conversationId);
      if (conversationWrapper === undefined) {
        return;
      }

      conversationWrapper.onNextTravisBackendMessageDomainViewModelsConversationMessageResponseViewModel(
        x,
      );
    });

    this.classicRealTimeService.getOnMessageReceived$().subscribe((x) => {
      if (x.conversationId === undefined || x.conversationId === null) {
        return;
      }

      const conversationWrapper = this.getConversationWrapper(x.conversationId);
      if (conversationWrapper === undefined) {
        return;
      }

      conversationWrapper.onNextTravisBackendMessageDomainViewModelsConversationMessageResponseViewModelOnMessageReceived(
        x,
      );
    });

    interval(60_000).subscribe(() => {
      const recyclingConversationIds: string[] = [];
      this.conversationIdToConversationWrapperMap.forEach((obj, key) => {
        if (
          new Date().getTime() - obj.lastObservedAt > 60_000 &&
          !obj.conversationWrapper.observed()
        ) {
          recyclingConversationIds.push(key);
        }
      });
      recyclingConversationIds.forEach((id) => {
        const conversationWrapperEntry =
          this.conversationIdToConversationWrapperMap.get(id);

        console.log(
          'Recycling ConversationWrapper',
          id,
          conversationWrapperEntry,
        );

        conversationWrapperEntry?.conversationWrapper.destroy();
        this.conversationIdToConversationWrapperMap.delete(id);
      });
    });
  }

  public getConversationWrapperUpdate$(): Observable<ConversationWrapperUpdate> {
    return this.conversationWrapperUpdate$$.asObservable();
  }

  public getOrInitConversationWrapper(
    id: string,
    travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel: TravisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel,
  ): ConversationWrapper {
    // Asserts
    if (
      !id ||
      !travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel.conversationId
    ) {
      throw new Error('conversationId is required');
    }
    if (
      id !==
      travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel.conversationId
    ) {
      throw new Error('conversationId does not match');
    }

    // Check if conversationWrapper exists and update it
    const conversationWrapper = this.getConversationWrapper(
      travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel.conversationId,
    );
    if (conversationWrapper !== undefined) {
      conversationWrapper.onNextTravisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel(
        travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel,
      );

      this.conversationIdToConversationWrapperMap.set(id, {
        conversationWrapper: conversationWrapper,
        lastObservedAt: new Date().getTime(),
      });

      return conversationWrapper;
    }

    // Create new conversationWrapper
    const newConversationWrapper = new ConversationWrapper({
      conversationWrapperConstructorParams: {
        travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel,
      },
      conversationWrapperUpdate$$: this.conversationWrapperUpdate$$,
      conversationMessageWrapperManagerService:
        this.conversationMessageWrapperManagerService,
      conversationApi: this.conversationApi,
      i18nService: this.i18nService,
    });

    this.conversationIdToConversationWrapperMap.set(id, {
      conversationWrapper: newConversationWrapper,
      lastObservedAt: new Date().getTime(),
    });

    return newConversationWrapper;
  }

  public getOrInitConversationWrapper2(
    id: string,
    travisBackendConversationDomainViewModelsConversationStatusResponseViewModel: TravisBackendConversationDomainViewModelsConversationStatusResponseViewModel,
  ): ConversationWrapper {
    // Asserts
    if (
      !id ||
      !travisBackendConversationDomainViewModelsConversationStatusResponseViewModel.conversationId
    ) {
      throw new Error('conversationId is required');
    }
    if (
      id !==
      travisBackendConversationDomainViewModelsConversationStatusResponseViewModel.conversationId
    ) {
      throw new Error('conversationId does not match');
    }

    // Check if conversationWrapper exists and update it
    const conversationWrapper = this.getConversationWrapper(
      travisBackendConversationDomainViewModelsConversationStatusResponseViewModel.conversationId,
    );
    if (conversationWrapper !== undefined) {
      conversationWrapper.onNextTravisBackendConversationDomainViewModelsConversationStatusResponseViewModel(
        travisBackendConversationDomainViewModelsConversationStatusResponseViewModel,
      );

      this.conversationIdToConversationWrapperMap.set(id, {
        conversationWrapper: conversationWrapper,
        lastObservedAt: new Date().getTime(),
      });

      return conversationWrapper;
    }

    throw new Error(
      'getOrInitConversationWrapper2 does not support init a new ConversationWrapper',
    );
  }

  public getOrInitConversationWrapper3(
    id: string,
    travisBackendConversationDomainViewModelsConversationAssignResponseViewModel: TravisBackendConversationDomainViewModelsConversationAssignResponseViewModel,
  ): ConversationWrapper {
    // Asserts
    if (
      !id ||
      !travisBackendConversationDomainViewModelsConversationAssignResponseViewModel.conversationId
    ) {
      throw new Error('conversationId is required');
    }
    if (
      id !==
      travisBackendConversationDomainViewModelsConversationAssignResponseViewModel.conversationId
    ) {
      throw new Error('conversationId does not match');
    }

    // Check if conversationWrapper exists and update it
    const conversationWrapper = this.getConversationWrapper(
      travisBackendConversationDomainViewModelsConversationAssignResponseViewModel.conversationId,
    );
    if (conversationWrapper !== undefined) {
      conversationWrapper.onNextTravisBackendConversationDomainViewModelsConversationAssignResponseViewModel(
        travisBackendConversationDomainViewModelsConversationAssignResponseViewModel,
      );

      this.conversationIdToConversationWrapperMap.set(id, {
        conversationWrapper: conversationWrapper,
        lastObservedAt: new Date().getTime(),
      });

      return conversationWrapper;
    }

    throw new Error(
      'getOrInitConversationWrapper3 does not support init a new ConversationWrapper',
    );
  }

  public getConversationWrapper(
    conversationId: string,
  ): ConversationWrapper | undefined {
    const obj = this.conversationIdToConversationWrapperMap.get(conversationId);
    if (obj === undefined) {
      return obj;
    }

    obj.lastObservedAt = new Date().getTime();

    return obj.conversationWrapper;
  }
}
