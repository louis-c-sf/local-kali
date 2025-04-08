import { Box, Typography } from '@mui/material';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import { useObservableEagerState } from 'observable-hooks';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { EllipsisTooltip } from '@/components/EllipsisTooltip';
import Icon from '@/components/Icon';
import { useMyProfile } from '@/hooks/useMyProfile';
import {
  ConversationMessageWrapper,
  MESSAGE_TYPE,
} from '@/services/conversation-messages/managers/conversation-message-wrapper';

import { getIsUnsupportedMessage } from '../ConversationWindow/ConversationMessageHistory/MessageContent/utils';

function ConversationListMessage({
  messageContent,
  lastMessageSender,
  startIcon,
  tooltip,
  highlightedSearchKeyword = '',
}: {
  highlightedSearchKeyword?: string;
  tooltip?: string;
  startIcon?: React.ReactNode;
  messageContent: string | undefined;
  lastMessageSender: string | null;
}) {
  const matches =
    messageContent === undefined || messageContent === null
      ? []
      : match(messageContent, highlightedSearchKeyword, {
          insideWords: true,
        });
  const parts = parse(messageContent || '', matches);
  return (
    <EllipsisTooltip
      title={tooltip ? tooltip.substring(0, 2048) : undefined}
      disableInteractive
    >
      <Typography
        sx={(theme) => ({
          ...theme.typography.ellipsis,
          WebkitLineClamp: '2',
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical',
          whiteSpace: 'wrap',
          lineClamp: 2,
        })}
        variant="body2"
      >
        <Typography
          component="span"
          variant="inherit"
          sx={{ fontWeight: 'bold' }}
        >
          {lastMessageSender}
        </Typography>
        {startIcon && (
          <>
            <Box
              component="span"
              sx={{
                display: 'inline-flex',
                width: '16px',
                height: '16px',
                position: 'relative',
                '& svg': {
                  width: '16px',
                  height: '16px',
                  position: 'absolute',
                  top: '25%',
                },
              }}
            >
              {startIcon}
            </Box>{' '}
          </>
        )}
        <Typography variant="inherit" component="span">
          {parts.map((part, index) => {
            return (
              <Box
                component="span"
                key={index}
                sx={{
                  background: (theme) =>
                    part.highlight ? theme.palette.mustard[5] : 'transparent',
                }}
              >
                {part.text}
              </Box>
            );
          })}
        </Typography>
      </Typography>
    </EllipsisTooltip>
  );
}

export default function ConversationListItemContent({
  conversationMessageWrapper,
  highlightedSearchKeyword,
}: {
  highlightedSearchKeyword: string;
  conversationMessageWrapper: ConversationMessageWrapper;
}) {
  const myProfile = useMyProfile();
  const { t } = useTranslation();
  let lastMessageSender = '';
  const sender = conversationMessageWrapper?.getSender();
  if (conversationMessageWrapper?.getDirection() !== 'incoming' && sender) {
    if (sender.id == myProfile.data?.userInfo.id) {
      lastMessageSender = 'You';
    } else {
      lastMessageSender = sender.displayName!;
    }
    lastMessageSender = `${lastMessageSender}: `;
  }
  const conversationStatus$ = useMemo(() => {
    return conversationMessageWrapper.getStatus$();
  }, [conversationMessageWrapper]);
  const conversationStatus = useObservableEagerState(conversationStatus$);
  const messageType = conversationMessageWrapper.getMessageType();
  const messageContent = conversationMessageWrapper.getMessageContent();
  const mediaType = conversationMessageWrapper.getUploadedFiles()?.[0];
  const isUnsupportedMessage = getIsUnsupportedMessage({ messageContent });
  const isDeletedMessage = conversationStatus === 'Deleted';

  // TODO: add/remove reaction message type
  if (isUnsupportedMessage) {
    return (
      <ConversationListMessage
        messageContent={t('inbox.conversation-list-item.unsupported', {
          defaultValue: 'Unsupported message type',
        })}
        lastMessageSender={lastMessageSender}
        startIcon={<Icon icon="alert-triangle" />}
      />
    );
  }

  if (isDeletedMessage) {
    return (
      <ConversationListMessage
        messageContent={t('inbox.conversation-list-item.deleted', {
          defaultValue: 'Deleted message',
        })}
        lastMessageSender={lastMessageSender}
        startIcon={<Icon icon="trash" />}
      />
    );
  }

  if (messageType == MESSAGE_TYPE.request_welcome) {
    return (
      <ConversationListMessage
        messageContent={t('inbox.conversation-list-item.request-welcome', {
          defaultValue:
            'This contact has opened a chat with you for the first time, you can now reply with a welcome message.',
        })}
        lastMessageSender={lastMessageSender}
      />
    );
  }

  if (messageType == MESSAGE_TYPE.file && mediaType) {
    if (mediaType.mimeType === 'image/gif') {
      return (
        <ConversationListMessage
          messageContent={t('inbox.conversation-list-item.gif', {
            defaultValue: 'GIF',
          })}
          lastMessageSender={lastMessageSender}
          startIcon={<Icon icon="gif" />}
        />
      );
    }

    if (mediaType.mimeType?.startsWith('image')) {
      return (
        <ConversationListMessage
          messageContent={t('inbox.conversation-list-item.photo', {
            defaultValue: 'Photo',
          })}
          lastMessageSender={lastMessageSender}
          startIcon={<Icon icon="image" />}
        />
      );
    }

    if (mediaType.mimeType?.startsWith('video')) {
      return (
        <ConversationListMessage
          messageContent={t('inbox.conversation-list-item.video', {
            defaultValue: 'Video',
          })}
          lastMessageSender={lastMessageSender}
          startIcon={<Icon icon="video" />}
        />
      );
    }

    if (mediaType.mimeType?.startsWith('audio')) {
      return (
        <ConversationListMessage
          messageContent={t('inbox.conversation-list-item.audio', {
            defaultValue: 'Audio',
          })}
          lastMessageSender={lastMessageSender}
          startIcon={<Icon icon="microphone" />}
        />
      );
    }

    return (
      <ConversationListMessage
        messageContent={t('inbox.conversation-list-item.attachment', {
          defaultValue: 'Attachment',
        })}
        lastMessageSender={lastMessageSender}
        startIcon={<Icon icon="clip" />}
      />
    );
  }

  return (
    <ConversationListMessage
      highlightedSearchKeyword={highlightedSearchKeyword}
      tooltip={messageContent}
      messageContent={messageContent}
      lastMessageSender={lastMessageSender}
    />
  );
}
