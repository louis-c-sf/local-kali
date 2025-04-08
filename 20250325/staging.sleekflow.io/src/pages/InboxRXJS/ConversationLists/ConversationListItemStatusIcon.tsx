import { Badge, badgeClasses } from '@mui/material';

import Icon from '@/components/Icon';
import MessageStatusIcon from '@/pages/InboxRXJS/ConversationWindow/ConversationMessageHistory/MessageWrapper/MessageStatusIcon';
import { MessagingChannel } from '@/services/companies/company.service';
import { ConversationMessageWrapperMessage } from '@/services/conversation-messages/managers/conversation-message-wrapper';

export default function ConversationListItemStatusIcon({
  unreadMessageCount,
  conversationMessageWrapperStatus,
  channelType,
}: {
  channelType: MessagingChannel['channelType'] | undefined;
  unreadMessageCount: number | null;
  conversationMessageWrapperStatus:
    | ConversationMessageWrapperMessage['status']
    | null;
}) {
  if (unreadMessageCount) {
    return (
      <Badge
        sx={{
          [`.${badgeClasses.badge}`]: {
            position: 'relative',
            transform: 'none',
            minWidth: '22px',
            minHeight: '22px',
          },
        }}
        max={9}
        badgeContent={unreadMessageCount}
        color="red"
      />
    );
  }

  if (channelType === 'note') {
    return (
      <Icon
        icon={'note'}
        sx={{
          flexShrink: 0,
          color: (theme) => theme.palette.orange[90],
        }}
      />
    );
  }

  return conversationMessageWrapperStatus ? (
    <MessageStatusIcon status={conversationMessageWrapperStatus} />
  ) : null;
}
