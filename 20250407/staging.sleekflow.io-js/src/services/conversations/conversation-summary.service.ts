import { ConversationApi } from '@sleekflow/sleekflow-core-typescript-rxjs-apis';
import { inject, injectable } from 'inversify';
import { combineLatest, map, Observable, of, switchMap, take } from 'rxjs';

import { LabelService } from '@/services/labels/label.service';

import { UserService } from '../user.service';
import { GetConversationBehaviorVersion } from './conversation-utils';
import { ConversationSummary } from './models/conversation-summary';
import { ConversationUnreadSummary } from './models/conversation-unread-summary';
import { GetConversationsFilter } from './models/get-conversations-filter';

@injectable()
export class ConversationSummaryService {
  constructor(
    @inject(ConversationApi) private conversationApi: ConversationApi,
    @inject(LabelService) private labelService: LabelService,
    @inject(UserService) private userService: UserService,
  ) {}

  public getConversationUnreadSummary$(): Observable<ConversationUnreadSummary> {
    return this.conversationApi.v3ConversationUnreadSummaryGet().pipe(
      map((resp) => {
        return {
          assignedToMe: resp.assignedToMe || 0,
          collaborations: resp.collaborator || 0,
          mentions: resp.mentioned || 0,
        };
      }),
    );
  }

  public getAllConversationSummary$(
    getConversationsFilter: GetConversationsFilter,
  ) {
    if (getConversationsFilter.assignedStaffId !== undefined) {
      throw new Error(
        'assignedStaffId is blocked for getAllConversationSummary$',
      );
    }
    if (getConversationsFilter.assignedTeamId !== undefined) {
      throw new Error(
        'assignedTeamId is blocked for getAllConversationSummary$',
      );
    }

    const myGetConversationsFilter: GetConversationsFilter = JSON.parse(
      JSON.stringify(getConversationsFilter),
    );

    myGetConversationsFilter.assignedStaffId = 'all';

    return this.getConversationSummary$(myGetConversationsFilter);
  }

  public getMentionedConversationSummary$(
    getConversationsFilter: GetConversationsFilter,
  ) {
    if (getConversationsFilter.assignedStaffId !== undefined) {
      throw new Error(
        'assignedStaffId is blocked for getMentionedConversationSummary$',
      );
    }
    if (getConversationsFilter.assignedTeamId !== undefined) {
      throw new Error(
        'assignedTeamId is blocked for getMentionedConversationSummary$',
      );
    }

    const myGetConversationsFilter: GetConversationsFilter = JSON.parse(
      JSON.stringify(getConversationsFilter),
    );

    myGetConversationsFilter.assignedStaffId = 'mentioned';

    return this.getConversationSummary$(myGetConversationsFilter);
  }

  public getCollaboratedConversationSummary$(
    getConversationsFilter: GetConversationsFilter,
  ) {
    if (getConversationsFilter.assignedStaffId !== undefined) {
      throw new Error(
        'assignedStaffId is blocked for getCollaboratedConversationSummary$',
      );
    }
    if (getConversationsFilter.assignedTeamId !== undefined) {
      throw new Error(
        'assignedTeamId is blocked for getCollaboratedConversationSummary$',
      );
    }

    const myGetConversationsFilter: GetConversationsFilter = JSON.parse(
      JSON.stringify(getConversationsFilter),
    );

    myGetConversationsFilter.assignedStaffId = 'collaborator';
    myGetConversationsFilter.isCollaborated = undefined;

    return this.getConversationSummary$(myGetConversationsFilter);
  }

  public getTeamConversationSummary$(
    getConversationsFilter: GetConversationsFilter,
  ) {
    if (getConversationsFilter.assignedTeamId === undefined) {
      throw new Error(
        'assignedTeamId is required for getTeamConversationSummary$',
      );
    }

    const myGetConversationsFilter: GetConversationsFilter = JSON.parse(
      JSON.stringify(getConversationsFilter),
    );

    if (getConversationsFilter.assignedStaffId === undefined) {
      myGetConversationsFilter.assignedStaffId = 'team';
    }

    return this.getConversationSummary$(myGetConversationsFilter);
  }

  public getStaffConversationSummary$(
    getConversationsFilter: GetConversationsFilter,
  ): Observable<ConversationSummary> {
    if (getConversationsFilter.assignedStaffId === undefined) {
      throw new Error('staffId is required for getStaffConversationSummary$');
    }
    if (getConversationsFilter.assignedTeamId !== undefined) {
      throw new Error(
        'assignedTeamId is blocked for getStaffConversationSummary$',
      );
    }

    const myGetConversationsFilter: GetConversationsFilter = JSON.parse(
      JSON.stringify(getConversationsFilter),
    );

    return this.getConversationSummary$(myGetConversationsFilter);
  }

  private getConversationSummary$(
    getConversationsFilter: GetConversationsFilter,
  ) {
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
          .v4ConversationSummaryAssignedToGet({
            assignedTo: getConversationsFilter.assignedStaffId!,
            status: getConversationsFilter.status,
            channel: getConversationsFilter.channelType,
            afterUpdatedAt: undefined,
            afterModifiedAt: undefined,
            channelIds:
              getConversationsFilter.channelIds === undefined
                ? getConversationsFilter.channelIds
                : getConversationsFilter.channelIds.join(','),
            tags: labels === undefined ? undefined : labels.join(','),
            teamId: getConversationsFilter.assignedTeamId,
            isTeamUnassigned: getConversationsFilter.isTeamUnassigned,
            isUnread: getConversationsFilter.isUnread,
            isCollaborator: getConversationsFilter.isCollaborated,
            behaviourVersion: GetConversationBehaviorVersion(
              getConversationsFilter,
              myStaff.id,
            ),
          })
          .pipe(
            map((getStaffConversationSummaryResponse) => {
              return (
                getStaffConversationSummaryResponse.conversationSummaries?.reduce(
                  (acc, nextVal) => {
                    acc[nextVal.status as keyof ConversationSummary] = {
                      ...acc[nextVal.status as keyof ConversationSummary],
                      [nextVal.type as keyof ConversationSummary[keyof ConversationSummary]]:
                        nextVal.count,
                    };

                    return acc;
                  },
                  {} as ConversationSummary,
                ) || {
                  open: {},
                  pending: {},
                  closed: {},
                  scheduled: {},
                  all: { total: 0 },
                }
              );
            }),
          );
      }),
    );
  }
}
