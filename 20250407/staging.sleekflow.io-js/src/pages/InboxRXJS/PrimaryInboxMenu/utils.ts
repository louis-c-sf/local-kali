import { GetConversationsFilter } from '@/services/conversations/models/get-conversations-filter';

export const INBOX_MENU_WIDTH = 240;

export const getInboxMenuSelectedItem = (
  filters: GetConversationsFilter,
  meta: {
    myUserProfileId: string | undefined;
  },
) => {
  if (filters.assignedStaffId === meta.myUserProfileId) {
    return 'assigned-to-me';
  }
  if (filters.isCollaborated) {
    return 'collaborations';
  }
  if (filters.isMentioned) {
    return 'mentions';
  }
  if (filters.assignedTeamId) {
    return String(filters.assignedTeamId);
  }
  return 'all';
};
