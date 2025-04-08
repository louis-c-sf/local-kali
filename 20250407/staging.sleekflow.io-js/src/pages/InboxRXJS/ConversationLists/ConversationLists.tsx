import { Box } from '@mui/material';

import { useMyProfile } from '@/hooks/useMyProfile';
import ConversationAssignedAndUnassignedTabs from '@/pages/InboxRXJS/ConversationLists/ConversationAssignedAndUnassignedTabs';
import ConversationListSkeleton from '@/pages/InboxRXJS/ConversationLists/ConversationListSkeleton';
import SearchConversationLists from '@/pages/InboxRXJS/ConversationLists/SearchConversationLists';
import {
  DEFAULT_CONVERSATION_FILTER,
  useGetConversationsFilter,
} from '@/pages/InboxRXJS/hooks/useGetConversationsFilter';
import { GetConversationsFilter } from '@/services/conversations/models/get-conversations-filter';
import { isBlank } from '@/utils/strings/isBlank';

import MainConversationList from './MainConversationList';

const getActiveTab = (getConversationParams: GetConversationsFilter) => {
  if (getConversationParams.isStaffAssigned !== undefined) {
    return getConversationParams.isStaffAssigned ? 'assigned' : 'unassigned';
  }

  return DEFAULT_CONVERSATION_FILTER.isStaffAssigned
    ? 'assigned'
    : 'unassigned';
};

const ConversationLists = () => {
  const globalGetConversationsFilter = useGetConversationsFilter();
  const myProfile = useMyProfile();
  const searchKeyword = globalGetConversationsFilter.searchKeyword;

  const staffIdentityId = myProfile.data?.userInfo?.id;
  if (!staffIdentityId) {
    return <ConversationListSkeleton />;
  }

  if (!isBlank(searchKeyword)) {
    return <SearchConversationLists />;
  }

  const shouldShowAssignedAndUnassignedTabs =
    globalGetConversationsFilter.getConversationsFilter.assignedStaffId !==
    String(staffIdentityId);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        height: '100%',
        width: '100%',
      }}
    >
      {shouldShowAssignedAndUnassignedTabs && (
        <ConversationAssignedAndUnassignedTabs
          value={getActiveTab(
            globalGetConversationsFilter.getConversationsFilter,
          )}
          onChange={(_, newValue) => {
            if (newValue === 'assigned') {
              globalGetConversationsFilter.setGetConversationsFilter(
                {
                  isStaffAssigned: true,
                } as GetConversationsFilter,
                {
                  discardPreviousValues: false,
                },
              );
            } else if (newValue === 'unassigned') {
              globalGetConversationsFilter.setGetConversationsFilter(
                {
                  isStaffAssigned: false,
                } as GetConversationsFilter,
                {
                  discardPreviousValues: false,
                },
              );
            }
          }}
          getConversationsFilter={
            globalGetConversationsFilter.getConversationsFilter
          }
        />
      )}
      <MainConversationList
        getConversationsFilter={
          globalGetConversationsFilter.getConversationsFilter
        }
      />
    </Box>
  );
};

export default ConversationLists;
