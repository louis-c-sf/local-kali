import ButtonBase from '@mui/material/ButtonBase';
import { memo } from 'react';

import { LinkBox } from '@/components/LinkOverlay';
import ConversationListItem from '@/pages/InboxRXJS/ConversationLists/ConversationListItem/ConversationListItem';
import { useGetConversationsFilter } from '@/pages/InboxRXJS/hooks/useGetConversationsFilter';
import { ConversationMessageWrapper } from '@/services/conversation-messages/managers/conversation-message-wrapper';
import { ConversationWrapper } from '@/services/conversations/managers/conversation-wrapper';
import { UserProfileWrapper } from '@/services/user-profiles/managers/user-profile-wrapper';

interface Props {
  conversation: ConversationWrapper;
  userProfile?: UserProfileWrapper;
  message?: ConversationMessageWrapper;
}

export const VirtualizedConversationListItem = memo(
  ({ conversation, userProfile, message }: Props) => {
    const globalGetConversationsFilter = useGetConversationsFilter();
    const searchKeyword = globalGetConversationsFilter.searchKeyword;

    return (
      <ButtonBase
        component={LinkBox}
        sx={{
          width: '100%',
          '& .more-actions-menu': {
            visibility: 'hidden',
            opacity: 0,
          },
          transition: 'visibility opacity 1s',
          '&:hover': {
            backgroundColor: (theme) =>
              theme.palette.componentToken.card.bgSelected,
            '& .more-actions-menu': {
              opacity: 1,
              visibility: 'visible',
            },
          },
          borderBottom: '1px solid',
          borderColor: (theme) =>
            theme.palette.componentToken.card.borderEnabled,
        }}
      >
        <ConversationListItem
          highlightedSearchKeyword={searchKeyword || ''}
          conversation={conversation}
          userProfile={userProfile}
          defaultMessage={message}
        />
      </ButtonBase>
    );
  },
);

VirtualizedConversationListItem.displayName = 'VirtualizedConversationListItem';
