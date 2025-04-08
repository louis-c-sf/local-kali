import type {
  TravisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel,
  TravisBackendConversationDomainViewModelsStaffConversationPermission,
  TravisBackendConversationDomainViewModelsStaffWithoutCompanyResponse,
} from '@sleekflow/sleekflow-core-typescript-rxjs-apis';
import { inject, injectable } from 'inversify';
import { combineLatest, map, of, switchMap, take } from 'rxjs';

import { ConversationMessageService } from '@/services/conversation-messages/conversation-message.service';
import { ConversationMessageWrapper } from '@/services/conversation-messages/managers/conversation-message-wrapper';
import { GetConversationsFilter } from '@/services/conversations/models/get-conversations-filter';
import { UserService } from '@/services/user.service';

import { RoleType } from '@/api/types';
import type { Staff } from '../companies/company.service';
import { ConversationWrapper } from './managers/conversation-wrapper';
import { ConversationWrapperManagerService } from './managers/conversation-wrapper-manager.service';
import { PermissionService } from '../permissions/permission.service';

interface MatchOptions {
  status?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  assignee?: Record<string, any> | null;
  labels?: { id?: string | null }[] | null;
  unreadMessageCount?: number;
  myStaff: Staff;
  lastMessage?: ConversationMessageWrapper | null;
  permissions?: TravisBackendConversationDomainViewModelsStaffConversationPermission | null;
}

@injectable()
export class ConversationMatcherService {
  constructor(
    @inject(UserService) private userService: UserService,
    @inject(ConversationMessageService)
    private conversationMessageService: ConversationMessageService,
    @inject(ConversationWrapperManagerService)
    private conversationWrapperManagerService: ConversationWrapperManagerService,
    @inject(PermissionService)
    private permissionService: PermissionService,
  ) {}

  doMatch = (
    filter: GetConversationsFilter & { searchKeyword?: string },
    {
      assignee,
      myStaff,
      status,
      unreadMessageCount,
      labels,
      lastMessage,
      permissions,
    }: MatchOptions,
  ) => {
    if (!permissions?.canView) {
      return false;
    }

    const teamInboxes = Object.keys(
      permissions?.inboxView?.teamInboxes || {},
    ).reduce(
      (acc, teamInboxId) => ({
        ...acc,
        [teamInboxId]: filter.assignedTeamId === +teamInboxId,
      }),
      {},
    );

    const inboxes = {
      assignedToMe: filter.assignedStaffId === myStaff.id,
      collaborations: filter.isCollaborated,
      mentions: filter.isMentioned,
      all:
        filter.assignedStaffId !== myStaff.id &&
        !filter.isCollaborated &&
        !filter.isMentioned &&
        !filter.assignedTeamId,
      ...teamInboxes,
    };
    type Inbox = keyof typeof inboxes;

    const activeInbox = Object.keys(inboxes).find(
      (key) => inboxes[key as Inbox],
    ) as Inbox | undefined;

    if (
      !activeInbox ||
      (!permissions?.inboxView?.[activeInbox] &&
        !permissions?.inboxView?.teamInboxes?.[activeInbox])
    ) {
      console.log('No active inbox');
      return false;
    }

    // when searching, results are not grouped into assigned and unassigned, so we don't have to check
    if (
      !filter.searchKeyword &&
      (!!filter.assignedStaffId || !!filter.isStaffAssigned) !== !!assignee
    ) {
      console.log('assigned mismatch', { filter, assignee });
      return false;
    }

    if (
      !['all', undefined].includes(filter.status) &&
      status !== filter.status
    ) {
      console.log('status mismatch', { filter, status });
      return false;
    }

    if (filter.isUnread && unreadMessageCount === 0) {
      console.log('unread mismatch', { filter, unreadMessageCount });
      return false;
    }

    if (
      filter.labelIds?.length &&
      labels?.every((l) => l.id && !filter.labelIds?.includes(l.id))
    ) {
      console.log('label mismatch', { filter, labels });
      return false;
    }

    if (
      filter.channelIds?.length &&
      filter.channelIds.every(
        (channelId) => channelId !== lastMessage?.getChannelIdentityId(),
      )
    ) {
      console.log('channel mismatch', { filter, lastMessage });
      return false;
    }

    return true;
  };

  private matchConversationWrapperWithFilters$ = (
    getConversationsFilter: GetConversationsFilter & { searchKeyword?: string },
    cw: ConversationWrapper,
  ) => {
    return combineLatest({
      status: cw.getStatus$(),
      assignee: cw.getAssignee$(),
      labels: cw.getLabels$(),
      unreadMessageCount: cw.getUnreadMessageCount$(),
      myStaff: this.userService.getMyStaff$(),
      lastMessage: cw.getLastMessageId$().pipe(
        take(1),
        switchMap((lastMessageId) => {
          if (lastMessageId === null) {
            return of(null);
          }

          return this.conversationMessageService
            .getMessage$(cw.getId(), lastMessageId)
            .pipe(take(1));
        }),
      ),
      permissions: cw.getPermissions$().pipe(take(1)),
    }).pipe(
      take(1),
      map((matchOptions) => this.doMatch(getConversationsFilter, matchOptions)),
    );
  };

  public matchConversationPayloadWithFilters = (
    getConversationsFilter: GetConversationsFilter,
    conversation: TravisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel,
    myStaff: Staff,
    lastMessage: ConversationMessageWrapper | null | undefined,
  ) => {
    return this.doMatch(getConversationsFilter, {
      status: conversation.status,
      assignee: conversation.assignee,
      labels: conversation.conversationHashtags,
      unreadMessageCount: conversation.unreadMessageCount,
      myStaff,
      lastMessage,
      permissions: conversation.staffConversationPermission,
    });
  };

  public matchConversationWrapper = (
    getConversationsFilter: GetConversationsFilter,
    cw: ConversationWrapper,
  ) => {
    return this.permissionService.getIsRbacEnabled$().pipe(
      switchMap((isRbacEnabled) =>
        isRbacEnabled
          ? this.matchConversationWrapperWithFilters$(
              getConversationsFilter,
              cw,
            )
          : combineLatest({
              status: cw.getStatus$(),
              assignee: cw.getAssignee$(),
              labels: cw.getLabels$(),
              assignedTeam: cw.getAssignedTeam$(),
              unreadMessageCount: cw.getUnreadMessageCount$(),
              collaborators: cw.getCollaborators$(),
              myStaff: this.userService.getMyStaff$(),
              lastMessage: cw.getLastMessageId$().pipe(
                take(1),
                switchMap((lastMessageId) => {
                  if (lastMessageId === null) {
                    return of(null);
                  }

                  return this.conversationMessageService
                    .getMessage$(cw.getId(), lastMessageId)
                    .pipe(take(1));
                }),
              ),
            }).pipe(
              take(1),
              map((x) => {
                if (getConversationsFilter.isStaffAssigned === true) {
                  if (x.assignee === null) {
                    return false;
                  }
                }
                if (getConversationsFilter.isStaffAssigned === false) {
                  if (x.assignee !== null) {
                    return false;
                  }
                }

                if (getConversationsFilter.assignedStaffId !== undefined) {
                  if (
                    x.assignee?.id !== getConversationsFilter.assignedStaffId
                  ) {
                    return false;
                  }
                }

                if (
                  getConversationsFilter.assignedTeamId &&
                  getConversationsFilter.assignedTeamId !== x.assignedTeam?.id
                ) {
                  return false;
                }

                if (
                  !['all', undefined].includes(getConversationsFilter.status)
                ) {
                  if (x.status !== getConversationsFilter.status) {
                    return false;
                  }
                }

                if (getConversationsFilter.isUnread !== undefined) {
                  if (
                    getConversationsFilter.isUnread &&
                    x.unreadMessageCount === 0
                  ) {
                    return false;
                  }
                }

                if (getConversationsFilter.labelIds !== undefined) {
                  if (getConversationsFilter.labelIds.length > 0) {
                    if (x.labels?.length === 0) {
                      return false;
                    }

                    if (
                      x.labels?.every(
                        (label) =>
                          !getConversationsFilter.labelIds?.includes(label.id),
                      )
                    ) {
                      return false;
                    }
                  }
                }

                if (getConversationsFilter.isCollaborated !== undefined) {
                  if (
                    getConversationsFilter.isCollaborated &&
                    x.collaborators.every((c) => c.staffId != x.myStaff.staffId)
                  ) {
                    return false;
                  }
                }

                if (getConversationsFilter.isMentioned !== undefined) {
                  if (
                    getConversationsFilter.isMentioned &&
                    (x.lastMessage === null ||
                      x.lastMessage?.getMessageAssignee()?.staffId !==
                        x.myStaff.staffId)
                  ) {
                    return false;
                  }
                }

                if (
                  getConversationsFilter.channelIds !== undefined &&
                  getConversationsFilter.channelIds.length > 0
                ) {
                  if (
                    getConversationsFilter.channelIds.every(
                      (channelId) =>
                        channelId !== x.lastMessage?.getChannelIdentityId(),
                    )
                  ) {
                    return false;
                  }
                }

                if (
                  this.isCompanyInbox(getConversationsFilter) &&
                  !this.hasConversationAccess(
                    x.myStaff,
                    x.collaborators,
                    x.assignee,
                    x.assignedTeam,
                  )
                ) {
                  return false;
                }
                // TODO
                // isTeamUnassigned?: boolean;

                return true;
              }),
            ),
      ),
    );
  };

  private isCompanyInbox = (getConversationsFilter: GetConversationsFilter) =>
    !getConversationsFilter.assignedStaffId &&
    !getConversationsFilter.assignedTeamId &&
    !getConversationsFilter.isCollaborated &&
    !getConversationsFilter.isMentioned;

  private hasConversationAccess = (
    myStaff: Staff,
    collaborators: { staffId: number }[] | undefined,
    assignee: { staffId?: number } | null | undefined,
    assignedTeam:
      | {
          id?: number;
          members?:
            | TravisBackendConversationDomainViewModelsStaffWithoutCompanyResponse[]
            | null;
        }
      | null
      | undefined,
  ) => {
    if (myStaff.roleType === RoleType.TEAMADMIN) {
      const isConversationUnassigned = !assignee && !assignedTeam;
      if (isConversationUnassigned) {
        return true;
      }

      const isAssignedToTeamMemberOrSelf =
        assignee?.staffId === myStaff.staffId ||
        myStaff.associatedTeams?.some((team) => assignedTeam?.id === team.id);
      if (isAssignedToTeamMemberOrSelf) {
        return true;
      }

      const teamMemberSet = new Set(
        assignedTeam?.members?.map((m) => m.staffId),
      );

      const isTeamMemberOrSelfInCollaborators = collaborators?.some(
        (c) => teamMemberSet.has(c.staffId) || c.staffId === myStaff.staffId,
      );
      if (isTeamMemberOrSelfInCollaborators) {
        return true;
      }

      return false;
    }

    return true;
  };

  public matchConversation = (
    getConversationsFilter: GetConversationsFilter,
    travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel: TravisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel,
    myStaff: Staff,
    lastMessage: ConversationMessageWrapper | null | undefined,
  ) => {
    if (getConversationsFilter.isStaffAssigned === true) {
      if (
        travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel.assignee ===
        null
      ) {
        return false;
      }
    }
    if (getConversationsFilter.isStaffAssigned === false) {
      if (
        travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel.assignee !==
        null
      ) {
        return false;
      }
    }

    if (getConversationsFilter.assignedStaffId !== undefined) {
      if (
        travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel
          .assignee?.userInfo?.id !== getConversationsFilter.assignedStaffId
      ) {
        return false;
      }
    }

    if (getConversationsFilter.assignedTeamId) {
      if (
        travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel
          .assignedTeam?.id !== getConversationsFilter.assignedTeamId
      ) {
        return false;
      }
    }

    if (
      getConversationsFilter.status !== undefined &&
      getConversationsFilter.status !== 'all'
    ) {
      if (
        travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel.status !==
        getConversationsFilter.status
      ) {
        return false;
      }
    }

    if (getConversationsFilter.isUnread !== undefined) {
      if (
        getConversationsFilter.isUnread &&
        travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel.unreadMessageCount ===
          0
      ) {
        return false;
      }
    }

    if (getConversationsFilter.labelIds !== undefined) {
      if (getConversationsFilter.labelIds.length > 0) {
        if (
          travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel
            .conversationHashtags?.length === 0
        ) {
          return false;
        }

        if (
          travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel.conversationHashtags?.every(
            (label) => !getConversationsFilter.labelIds?.includes(label.id!),
          )
        ) {
          return false;
        }
      }
    }

    if (getConversationsFilter.isCollaborated !== undefined) {
      if (
        getConversationsFilter.isCollaborated &&
        travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel.additionalAssignees?.every(
          (c) => c.assignee != null && c.assignee.staffId !== myStaff.staffId,
        )
      ) {
        return false;
      }
    }

    if (getConversationsFilter.isMentioned !== undefined) {
      if (
        getConversationsFilter.isMentioned &&
        (lastMessage === null ||
          lastMessage === undefined ||
          lastMessage.getMessageAssignee()?.staffId !== myStaff.staffId)
      ) {
        return false;
      }
    }

    if (
      getConversationsFilter.channelIds !== undefined &&
      getConversationsFilter.channelIds.length > 0
    ) {
      if (
        getConversationsFilter.channelIds.every(
          (channelId) => channelId !== lastMessage?.getChannelIdentityId(),
        )
      ) {
        return false;
      }
    }

    const { assignee, assignedTeam, additionalAssignees } =
      travisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel;
    const collaborators =
      additionalAssignees
        ?.map((c) => ({ staffId: c.assignee?.staffId }))
        ?.filter((c): c is { staffId: number } => !!c.staffId) || [];

    if (
      this.isCompanyInbox(getConversationsFilter) &&
      !this.hasConversationAccess(
        myStaff,
        collaborators,
        assignee,
        assignedTeam,
      )
    ) {
      return false;
    }

    // TODO
    // isTeamUnassigned?: boolean;

    return true;
  };
}
