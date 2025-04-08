import { keyframes } from '@mui/material';

import Icon, { IconProps } from '@/components/Icon';
import { ConversationMessageWrapperMessage } from '@/services/conversation-messages/managers/conversation-message-wrapper';
import { exhaustiveGuard } from '@/utils/ts-utils';

const COMMON_CSS = {
  flexShrink: 0,
};

const rotate = keyframes`
0% {transform: rotate(0deg)}
100% {transform: rotate(360deg)}
`;

export default function MessageStatusIcon({
  status,
  ...rest
}: Pick<ConversationMessageWrapperMessage, 'status'> &
  Pick<IconProps, 'size'>) {
  switch (status) {
    case 'Queued':
    case 'Sending':
      return (
        <Icon
          icon="loading"
          sx={{
            color: 'gray.80',
            animationName: `${rotate}`,
            animationDuration: '1s',
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite',
            ...COMMON_CSS,
          }}
          {...rest}
        />
      );
    case 'Received':
      return (
        <Icon
          icon="check-double"
          sx={{ color: 'gray.80', ...COMMON_CSS }}
          {...rest}
        />
      );
    case 'Read':
      return (
        <Icon
          icon="check-double"
          sx={{ color: 'blue.70', ...COMMON_CSS }}
          {...rest}
        />
      );
    case 'Sent':
      return (
        <Icon
          icon="check-single"
          sx={{ color: 'gray.80', ...COMMON_CSS }}
          {...rest}
        />
      );
    case 'Scheduled': {
      return (
        <Icon
          icon="clock-rewind"
          sx={{ color: 'gray.80', ...COMMON_CSS }}
          {...rest}
        />
      );
    }
    case 'Deleted': {
      return (
        <Icon icon="trash" sx={{ color: 'gray.80', ...COMMON_CSS }} {...rest} />
      );
    }
    case 'Undelivered':
    case 'OutOfCredit':
    case 'Failed':
      return (
        <Icon
          icon={'alert-circle'}
          sx={{
            color: 'red.90',
            ...COMMON_CSS,
          }}
          {...rest}
        />
      );
    default:
      return exhaustiveGuard(
        status,
        `${status} is an impossible message status`,
      );
  }
}
