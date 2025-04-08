import { GetConversationsFilter } from './models/get-conversations-filter';

export function GetConversationBehaviorVersion(
  filter?: GetConversationsFilter,
  myStaffId?: string,
): '1' | '2' {
  const assignedStaffId = filter?.assignedStaffId?.toLowerCase() || '';

  if (assignedStaffId === 'all' || assignedStaffId === 'team') {
    return '1';
  }

  if (assignedStaffId !== myStaffId) {
    return '1';
  }

  return '2';
}
