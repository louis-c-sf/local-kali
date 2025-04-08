import {
  IContactAccessLevelMatcher,
  ActionType,
  ScopeType,
} from './IContactAccessLevelMatcher';
import { PERMISSION_KEY, PermissionKey } from '@/constants/permissions';
import { CheckWrapper } from '@/hooks/usePermission';
import { Team } from '../../../../../api/types';

type ConversationDetailProvider = {
  getAssignee: () => { staffId: number } | null;
  getCollaborators: () => Array<{ staffId: number }> | undefined;
  getAssignedTeam: () => { id: number } | null;
};

export class ContactAccessGuard {
  constructor(
    private matcher: IContactAccessLevelMatcher,
    private checkWrapper: CheckWrapper,
    private isRbacEnabled: boolean,
  ) {}

  allowView(): boolean {
    if (!this.isRbacEnabled) {
      return true;
    }
    return this.allowByHierarchy('view');
  }

  allowEdit(): boolean {
    if (!this.isRbacEnabled) {
      return true;
    }
    return this.allowByHierarchy('edit');
  }

  allowDelete(fallbackValue: boolean): boolean {
    if (!this.isRbacEnabled) {
      return fallbackValue;
    }
    return this.allowByHierarchy('delete');
  }

  private allowByHierarchy(action: ActionType) {
    if (this.matcher.matchesUnassigned()) {
      if (
        this.check(ContactAccessGuard.selectPermission(action, 'unassigned'))
      ) {
        return true;
      }
    }

    if (this.matcher.matchesOwner() || this.matcher.matchesCollaborator()) {
      if (this.check(ContactAccessGuard.selectPermission(action, 'owner'))) {
        return true;
      }
    }

    if (this.matcher.matchesTeamMember()) {
      if (this.check(ContactAccessGuard.selectPermission(action, 'team'))) {
        return true;
      }
    }

    if (this.matcher.matchesOthers()) {
      return this.check(ContactAccessGuard.selectPermission(action, 'others'));
    }

    return false;
  }

  private static permissionsMap: Record<
    ActionType,
    Record<ScopeType, PermissionKey>
  > = {
    view: {
      unassigned: PERMISSION_KEY.contactsAssignedToNoneView,
      team: PERMISSION_KEY.contactsAssignedToMyTeamView,
      others: PERMISSION_KEY.contactsAssignedToOthersView,
      owner: PERMISSION_KEY.contactsAssignedToMeView,
    },
    edit: {
      unassigned: PERMISSION_KEY.contactsAssignedToNoneEdit,
      team: PERMISSION_KEY.contactsAssignedToMyTeamEdit,
      others: PERMISSION_KEY.contactsAssignedToOthersEdit,
      owner: PERMISSION_KEY.contactsAssignedToMeEdit,
    },
    delete: {
      unassigned: PERMISSION_KEY.contactsAssignedToNoneDelete,
      team: PERMISSION_KEY.contactsAssignedToMyTeamDelete,
      others: PERMISSION_KEY.contactsAssignedToOthersDelete,
      owner: PERMISSION_KEY.contactsAssignedToMeDelete,
    },
  };

  private static selectPermission(action: ActionType, scope: ScopeType) {
    if (!this.permissionsMap[action]?.[scope]) {
      throw new Error(`Unsupported action/scope: ${action}/${scope}`);
    }
    return this.permissionsMap[action]?.[scope];
  }

  private check(flag: PermissionKey): boolean {
    if (!this.isRbacEnabled) {
      throw new Error(
        'RBAC is disabled, do not try to check permissions as it uses "true" as a fallback',
      );
    }
    return this.checkWrapper([flag], [true])[0];
  }
}

export class ConversationMatcher implements IContactAccessLevelMatcher {
  constructor(
    private conversationWrapper: ConversationDetailProvider,
    private staffId: number,
    private myTeams: Array<Team>,
  ) {}

  matchesUnassigned(): boolean {
    return (
      !this.conversationWrapper.getAssignee() &&
      !this.conversationWrapper.getAssignedTeam() &&
      this.conversationWrapper.getCollaborators()?.length === 0
    );
  }

  matchesOthers(): boolean {
    return (
      !this.matchesOwner() &&
      !this.matchesTeamMember() &&
      !this.matchesCollaborator()
    );
  }

  matchesOwner(): boolean {
    return this.isMatchingAssignee() || this.matchesCollaborator();
  }

  matchesCollaborator(): boolean {
    return !!this.conversationWrapper
      .getCollaborators()
      ?.some((c) => c.staffId === this.staffId);
  }

  matchesTeamMember(): boolean {
    return this.myTeams.some(
      (t) => t.id === this.conversationWrapper.getAssignedTeam()?.id,
    );
  }

  private isMatchingAssignee() {
    return (
      this.staffId === (this.conversationWrapper.getAssignee()?.staffId ?? 0)
    );
  }
}
