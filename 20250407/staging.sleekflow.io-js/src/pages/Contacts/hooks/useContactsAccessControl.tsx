import { usePermissionWrapper } from '../../../hooks/usePermission';
import { PERMISSION_KEY } from '../../../constants/permissions';
import { ConversationWrapper } from '../../../services/conversations/managers/conversation-wrapper';
import { useMemo } from 'react';
import {
  ConversationMatcher,
  ContactAccessGuard,
} from '../shared/accessRuleGuard/ContactAccessLevelMatcher/ContactAccessGuard';
import { RoleType } from '../../../api/types';
import { useSuspenseMyProfile } from '../../../hooks/useMyProfile';
import { useSuspenseTeamList } from '../../../api/company';

export function useContactsAccessControl() {
  const { check, isEnabledRbac } = usePermissionWrapper({
    suspense: true,
  });
  const myStaffQuery = useSuspenseMyProfile();
  const myStaff = myStaffQuery.data;
  const myTeamsQuery = useSuspenseTeamList({
    select: (teams) =>
      teams.filter(
        (team) =>
          !!myStaff?.associatedTeams?.some((t) => t.id === String(team.id)),
      ),
  });
  const myTeams = myTeamsQuery.data;
  const teamsLoading = myTeamsQuery.isLoading;

  const loading = useMemo(
    () => myStaffQuery.isLoading || teamsLoading,
    [myStaffQuery.isLoading, teamsLoading],
  );

  const canChangeAssignee = check(
    [
      PERMISSION_KEY.contactsAssignToMe,
      PERMISSION_KEY.contactsAssignToMyTeam,
      PERMISSION_KEY.contactsAssignToOthers,
    ],
    [true, true, true],
  ).some(Boolean);

  const canDeleteContactsLegacy =
    myStaff?.roleType && myStaff.roleType !== RoleType.STAFF;

  const canDeleteSomeContacts = check(
    [
      PERMISSION_KEY.contactsAssignedToMeDelete,
      PERMISSION_KEY.contactsAssignedToNoneDelete,
      PERMISSION_KEY.contactsAssignedToMyTeamDelete,
      PERMISSION_KEY.contactsAssignedToOthersDelete,
    ],
    [canDeleteContactsLegacy],
  ).some(Boolean);

  const canEditSomeContacts = check(
    [
      PERMISSION_KEY.contactsAssignedToMeEdit,
      PERMISSION_KEY.contactsAssignedToNoneEdit,
      PERMISSION_KEY.contactsAssignedToMyTeamEdit,
      PERMISSION_KEY.contactsAssignedToOthersEdit,
    ],
    [true],
  )[0];

  return {
    canCreateContacts: check([PERMISSION_KEY.contactsCreate], [true])[0],

    canViewLists: check([PERMISSION_KEY.contactsListView], [true])[0],
    canCreateLists: check([PERMISSION_KEY.contactsListCreate], [true])[0],
    canEditLists: check([PERMISSION_KEY.contactsListEdit], [true])[0],
    canDeleteLists: check([PERMISSION_KEY.contactsListDelete], [true])[0],
    canAddRemoveListContacts: check(
      [PERMISSION_KEY.contactsListAddRemoveContacts],
      [true],
    )[0],
    canExportLists: check(
      [PERMISSION_KEY.contactsExport],
      [myStaff?.roleType === RoleType.ADMIN],
    )[0],

    canAccessContacts: check([PERMISSION_KEY.contactsAccess], [true])[0],
    canViewOwnContacts: check(
      [PERMISSION_KEY.contactsAssignedToMeView],
      [true],
    )[0],
    canViewTeamContacts: check(
      [PERMISSION_KEY.contactsAssignedToMyTeamView],
      [[RoleType.ADMIN, RoleType.TEAMADMIN].includes(myStaff?.roleType)],
    )[0],

    canViewContactDetails: (profile: ConversationWrapper) => {
      if (!myStaff) {
        throw new Error('Staff is missing after loaded');
      }

      const matcher = new ConversationMatcher(
        profile,
        myStaff.staffId,
        myTeams,
      );
      const guard = new ContactAccessGuard(matcher, check, isEnabledRbac);

      return guard.allowView();
    },

    canEditContact(profile: ConversationWrapper) {
      if (!myStaff) {
        throw new Error('Staff is missing after loaded');
      }
      const matcher = new ConversationMatcher(
        profile,
        myStaff.staffId,
        myTeams,
      );
      const guard = new ContactAccessGuard(matcher, check, isEnabledRbac);

      return guard.allowEdit();
    },

    canDeleteContact(profile: ConversationWrapper) {
      if (loading) {
        return false;
      }
      if (!myStaff) {
        throw new Error('Staff is missing after loaded');
      }
      const matcher = new ConversationMatcher(
        profile,
        myStaff.staffId,
        myTeams,
      );
      const guard = new ContactAccessGuard(matcher, check, isEnabledRbac);

      return guard.allowDelete(canDeleteSomeContacts ?? false);
    },

    canDeleteSomeContacts,
    canEditSomeContacts,

    canSetAssigneeToMe: check([PERMISSION_KEY.contactsAssignToMe], [true])[0],
    canSetAssigneeToMyTeammates: check(
      [PERMISSION_KEY.contactsAssignToMyTeam],
      [true],
    )[0],
    canSetAssigneeToOthers: check(
      [PERMISSION_KEY.contactsAssignToOthers],
      [true],
    )[0],
    canChangeAssignee,
  };
}
