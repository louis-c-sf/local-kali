import { iconButtonClasses, Tooltip } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { useObservableState } from 'observable-hooks';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  useCloseConversationMutation,
  useOpenConversationMutation,
  usePinConversationMutation,
  useReadConversationMutation,
  useUnpinConversationMutation,
  useUnreadConversationMutation,
} from '@/api/conversation';
import Icon from '@/components/Icon';
import SnoozeConversationDialog from '@/pages/InboxRXJS/ConversationDropdown/SnoozeConversationDialog';
import { ConversationWrapper } from '@/services/conversations/managers/conversation-wrapper';
import { useDebugMode } from '@/utils/useDebugMode';

import { DeleteContactConfirmationDialog } from './DeleteContactConfirmationDialog';
import {
  SelectMenu,
  SelectMenuItem,
} from '../ConversationWindow/ConversationControls/SelectMenu';
import useSnackbar from '@/hooks/useSnackbar';

interface ConversationDropdownProps {
  conversation: ConversationWrapper;
  buttonStyle?: React.CSSProperties;
  allowChangeConversationStatus?: boolean;
}

const ConversationDropdown: React.FC<ConversationDropdownProps> = ({
  conversation,
  buttonStyle,
  allowChangeConversationStatus = true,
}) => {
  const { t } = useTranslation();
  const snackbar = useSnackbar();

  const { mutateAsync: unpinConversation } = useUnpinConversationMutation(
    conversation.getId(),
    {
      onSuccess: () =>
        snackbar.info(
          t(
            'inbox.thread.unpin-conversation-success',
            'You have unpinned a conversation',
          ),
        ),
    },
  );
  const { mutateAsync: pinConversation } = usePinConversationMutation(
    conversation.getId(),
    {
      onSuccess: () =>
        snackbar.info(
          t(
            'inbox.thread.pin-conversation-success',
            'You have pinned a conversation',
          ),
        ),
    },
  );
  const { mutateAsync: openConversation } = useOpenConversationMutation(
    conversation.getId(),
  );
  const { mutateAsync: closeConversation } = useCloseConversationMutation(
    conversation.getId(),
  );
  const { mutateAsync: readConversation } = useReadConversationMutation(
    conversation.getId(),
  );
  const { mutateAsync: unreadConversation } = useUnreadConversationMutation(
    conversation.getId(),
  );

  const debugMode = useDebugMode((s) => s.debugMode);

  const [isSnoozeConversationModalOpen, setIsSnoozeConversationModalOpen] =
    useState(false);
  const [isDeleteConversationModalOpen, setIsDeleteConversationModalOpen] =
    useState(false);

  const unreadMessageCount = useObservableState(
    conversation.getUnreadMessageCount$(),
    null,
  );
  const isPinned = useObservableState(conversation.getIsPinned$(), null);
  const status = useObservableState(conversation.getStatus$(), null);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    setAnchorEl(event.currentTarget);
  };

  const handleClose = (event: any) => {
    if (event) {
      event.stopPropagation();
    }

    setAnchorEl(null);
  };

  const items = [
    {
      label: isPinned
        ? t('inbox.thread.unpin-conversation')
        : t('inbox.thread.pin-conversation'),
      onClick: () => {
        if (isPinned) {
          unpinConversation();
        } else {
          pinConversation();
        }
      },
    },
    {
      label:
        unreadMessageCount && unreadMessageCount > 0
          ? t('inbox.thread.mark-as-read')
          : t('inbox.thread.mark-as-unread'),
      onClick: () => {
        if (unreadMessageCount && unreadMessageCount > 0) {
          readConversation();
          snackbar.info(
            t(
              'inbox.thread.mark-as-read-success',
              'You have marked this conversation as read',
            ),
          );
        } else {
          unreadConversation();
          snackbar.info(
            t(
              'inbox.thread.mark-as-unread-success',
              'You have marked this conversation as unread',
            ),
          );
        }
      },
    },
    allowChangeConversationStatus && {
      label:
        status === 'closed' || status === 'pending'
          ? t('inbox.thread.open-conversation')
          : t('inbox.thread.close-conversation'),
      onClick: () => {
        if (status === 'closed' || status === 'pending') {
          openConversation();
        } else {
          closeConversation();
        }
      },
    },
    allowChangeConversationStatus &&
      (status === 'open' || status === 'closed') && {
        label: t('inbox.thread.snooze-conversation'),
        onClick: () => {
          setIsSnoozeConversationModalOpen(true);
        },
      },
    debugMode && {
      label: t(
        'inbox.thread.delete-conversation',
        'Delete contact permanently',
      ),
      onClick: () => {
        setIsDeleteConversationModalOpen(true);
      },
      color: 'red',
    },
  ].filter(
    (item): item is { label: string; onClick: () => void; color?: string } =>
      !!item,
  );

  return (
    <>
      <Tooltip
        title={t('conversation-controls.dropdown', {
          defaultValue: 'More actions',
        })}
        placement="bottom"
      >
        <IconButton
          aria-label="more"
          aria-controls={open ? 'long-menu' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-haspopup="true"
          className="more-actions-menu"
          sx={[
            {
              ...(open && {
                [`&.${iconButtonClasses.root}.${iconButtonClasses.root}`]: {
                  visibility: 'visible',
                  opacity: 1,
                },
              }),
            },
            ...(Array.isArray(buttonStyle) ? buttonStyle : [buttonStyle]),
          ]}
          onClick={handleButtonClick}
        >
          <Icon icon="dots-horizontal" />
        </IconButton>
      </Tooltip>
      <SelectMenu
        id="long-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'long-button',
        }}
      >
        {items.map((item) => (
          <SelectMenuItem
            key={item.label}
            onClick={(e) => {
              e.stopPropagation();
              handleClose(undefined);
              item.onClick();
            }}
            {...(item.color === 'red' && {
              sx: {
                color: 'red.90',
                ':hover': {
                  color: 'red.90',
                  bgcolor: 'red.5',
                },
              },
            })}
          >
            {item.label}
          </SelectMenuItem>
        ))}
      </SelectMenu>
      <SnoozeConversationDialog
        isSnoozeConversationModalOpen={isSnoozeConversationModalOpen}
        setIsSnoozeConversationModalOpen={setIsSnoozeConversationModalOpen}
        conversation={conversation}
      />
      <DeleteContactConfirmationDialog
        open={isDeleteConversationModalOpen}
        onClose={() => setIsDeleteConversationModalOpen(false)}
        userProfileId={conversation.getUserProfileId()}
      />
    </>
  );
};

export default ConversationDropdown;
