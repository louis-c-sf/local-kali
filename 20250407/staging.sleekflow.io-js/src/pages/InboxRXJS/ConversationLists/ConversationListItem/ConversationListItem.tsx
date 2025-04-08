import {
  Badge,
  Box,
  Chip,
  IconButton,
  ListItem,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import { useInjection } from 'inversify-react';
import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { of } from 'rxjs';

import { Avatar } from '@/components/Avatar';
import Icon, { IconProps } from '@/components/Icon';
import { TruncatedChipGroup } from '@/components/TruncatedChipGroup';
import { LABELS_COLOR_MAPPING } from '@/constants/label';
import ConversationDropdown from '@/pages/InboxRXJS/ConversationDropdown';
import ConversationListItemContent from '@/pages/InboxRXJS/ConversationLists/ConversationListItemContent';
import ConversationListItemStatusIcon from '@/pages/InboxRXJS/ConversationLists/ConversationListItemStatusIcon';
import useConversationTabs from '@/pages/InboxRXJS/hooks/useConversationTabs';
import { useTypedPosthog } from '@/posthog/useTypedPosthog';
import { MyConversationInputViewModelManager } from '@/services/conversation-inputs/my-conversation-input-view-model-manager';
import { ConversationMessageWrapper } from '@/services/conversation-messages/managers/conversation-message-wrapper';
import { ConversationMessageWrapperManagerService } from '@/services/conversation-messages/managers/conversation-message-wrapper-manager.service';
import { ConversationWrapper } from '@/services/conversations/managers/conversation-wrapper';
import { UserProfileWrapper } from '@/services/user-profiles/managers/user-profile-wrapper';
import theme from '@/themes';
import { adaptiveFormat } from '@/utils/dates/adaptiveFormat';
import {
  getIsConversationAccessibleQueryOptions,
  useUnpinConversationMutation,
} from '@/api/conversation';
import { useObservableEagerState } from '@/hooks/useObservableEagerState';
import { useQueryClient } from '@tanstack/react-query';

interface ConversationListItemProps {
  conversation: ConversationWrapper;
  userProfile?: UserProfileWrapper;
  defaultMessage?: ConversationMessageWrapper;
  highlightedSearchKeyword: string;
  selected?: boolean;
}

export const getConversationListItemKey = ({
  conversationId,
  userProfileId,
  defaultMessageId,
}: {
  conversationId: string | undefined;
  userProfileId: string | undefined;
  defaultMessageId?: number;
}) => {
  return [conversationId, userProfileId, defaultMessageId].join('-');
};

const ConversationListItem: React.FC<ConversationListItemProps> = ({
  selected: selectedProp,
  conversation: conversationProp,
  userProfile: userProfileProp,
  defaultMessage,
  highlightedSearchKeyword,
}) => {
  const queryClient = useQueryClient();
  const posthog = useTypedPosthog();
  const { mutateAsync: unpinConversation } = useUnpinConversationMutation(
    conversationProp.getId(),
  );

  const conversationMessageWrapperManagerService = useInjection(
    ConversationMessageWrapperManagerService,
  );
  const userProfileSelector = useCallback(
    (userProfile: UserProfileWrapper | undefined) => {
      return {
        phoneNumber$: userProfile
          ? userProfile.getPhoneNumber$.bind(userProfile)()
          : of(''),
        fullName$: userProfile
          ? userProfile.getFullName$.bind(userProfile)()
          : of('Deleted User'),
        pictureUrl$: userProfile
          ? userProfile.getPictureUrl$.bind(userProfile)()
          : of(''),
        displayProfilePicture: userProfile
          ? userProfile.getDisplayProfilePicture.bind(userProfile)()
          : '',
      };
    },
    [],
  );

  const conversationSelector = useCallback(
    (conversation: ConversationWrapper) => {
      return {
        assignedTo$: conversation.getAssignee$.bind(conversation)(),
        status$: conversation.getStatus$.bind(conversation)(),
        lastMessageId$: conversation.getLastMessageId$.bind(conversation)(),
        labels$: conversation.getLabels$.bind(conversation)(),
        lastIncomingMessagingChannelType$:
          conversation.getLastIncomingMessagingChannelType$.bind(
            conversation,
          )(),
        unreadMessageCount$:
          conversation.getUnreadMessageCount$.bind(conversation)(),
        isPinned$: conversation.getIsPinned$.bind(conversation)(),
        id: conversation.getId(),
      };
    },
    [],
  );
  const userProfile = userProfileSelector(userProfileProp);
  const phoneNumber = useObservableEagerState(userProfile.phoneNumber$, '');
  const conversation = conversationSelector(conversationProp);
  const myConversationInputViewModelManager =
    useInjection<MyConversationInputViewModelManager>(
      MyConversationInputViewModelManager,
    );
  const { activeConversationTabConversationId } = useConversationTabs();
  const { t } = useTranslation();
  const [_, setSearchParams] = useSearchParams();
  const isSelected =
    selectedProp !== undefined
      ? selectedProp
      : (activeConversationTabConversationId || '') ===
        conversationProp.getId();

  const lastMessageId = useObservableEagerState(
    conversation.lastMessageId$,
    null,
  );
  const lastMessage = lastMessageId
    ? conversationMessageWrapperManagerService.getConversationMessageWrapper(
        lastMessageId,
      )
    : undefined;
  const labels = useObservableEagerState(conversation.labels$, null);
  const lastMessagingChannel = useObservableEagerState(
    conversation.lastIncomingMessagingChannelType$,
    null,
  );
  const conversationAssignee = useObservableEagerState(
    conversation.assignedTo$,
    null,
  );
  const conversationStatus = useObservableEagerState(
    conversation.status$,
    null,
  );
  const unreadMessageCount = useObservableEagerState(
    conversation.unreadMessageCount$,
    null,
  );
  const isPinned = useObservableEagerState(conversation.isPinned$, false);
  const fullName = useObservableEagerState(userProfile.fullName$, '');

  const conversationMessageWrapper =
    defaultMessage !== undefined ? defaultMessage : lastMessage;
  const conversationMessageWrapperStatus = useObservableEagerState(
    conversationMessageWrapper
      ? conversationMessageWrapper!.getStatus$()
      : of(null),
    null,
  );
  const nameMatches = match(fullName, highlightedSearchKeyword || '', {
    insideWords: true,
  });
  const nameParts = parse(fullName, nameMatches);

  const onConversationSelected = (
    conversationWrapper: ConversationWrapper,
    message?: ConversationMessageWrapper,
  ) => {
    posthog.capture('inbox:select_conversation_from_list', {});
    if (message) {
      myConversationInputViewModelManager.setConversationSelectedDisplayChannel(
        conversationWrapper.getId(),
        conversationWrapper.getUserProfileId(),
        '',
      );
      setSearchParams((prev) => {
        prev.set('defaultMessageId', message.getId().toString());
        prev.set('conversationId', conversationWrapper.getId());
        return prev;
      });
      return;
    }
    setSearchParams((prev) => {
      prev.set('conversationId', conversationWrapper.getId());
      return prev;
    });
  };

  const prefetchIsConversationAccessible = useCallback(() => {
    queryClient.prefetchQuery({
      ...getIsConversationAccessibleQueryOptions({
        conversationId: conversationProp.getId(),
        conversationWrapper: conversationProp,
      }),
      staleTime: Infinity,
    });
  }, [conversationProp, queryClient]);

  return (
    <ListItem
      data-assignee-id={conversationAssignee?.id}
      data-status={conversationStatus}
      data-conversationid={conversation.id}
      data-phonenumber={phoneNumber}
      {...(conversationMessageWrapper && {
        'data-messagecontent': conversationMessageWrapper.getMessageContent(),
      })}
      data-name={fullName}
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        background: (theme) =>
          isSelected
            ? theme.palette.componentToken.card.bgSelected
            : theme.palette.white,
        p: 2,
      }}
      onMouseEnter={prefetchIsConversationAccessible}
      onClick={() => {
        onConversationSelected(conversationProp, defaultMessage);
      }}
    >
      <Stack
        justifyContent="space-between"
        height="100%"
        width="100%"
        spacing={1}
      >
        <Box>
          <Box
            minWidth="0px"
            width="100%"
            display="flex"
            alignItems="center"
            gap={2}
            paddingBottom={1}
            justifyContent="space-between"
          >
            <Stack
              direction="row"
              flexShrink={1}
              minWidth={0}
              spacing={2}
              alignItems="center"
            >
              <Badge
                invisible={!lastMessagingChannel}
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  lastMessagingChannel ? (
                    <Icon
                      sx={{
                        background: 'white',
                      }}
                      icon={lastMessagingChannel as IconProps['icon']}
                    />
                  ) : null
                }
              >
                <Avatar
                  src={userProfile?.displayProfilePicture || undefined}
                  alt={fullName}
                />
              </Badge>
              <Typography
                minWidth={0}
                flexShrink={1}
                variant="headline4"
                color="primary"
                sx={(theme) => ({
                  fontWeight: 600,
                  color: theme.palette.contentSecondary,
                  ...theme.typography.ellipsis,
                })}
              >
                {nameParts.map((part, index) => {
                  return (
                    <Box
                      component="span"
                      key={index}
                      sx={{
                        background: (theme) =>
                          part.highlight
                            ? theme.palette.mustard[5]
                            : 'transparent',
                      }}
                    >
                      {part.text}
                    </Box>
                  );
                })}
              </Typography>
            </Stack>
            <Stack
              flexShrink={0}
              alignItems="center"
              spacing={1}
              direction="row"
            >
              {conversationMessageWrapper?.getCreatedAt() ? (
                <Typography variant="body3">
                  {adaptiveFormat(
                    conversationMessageWrapper?.getCreatedAt(),
                    'HH:mm',
                    'dd MMM',
                  )}
                </Typography>
              ) : null}
              {isPinned && (
                <Tooltip title={t('inbox.thread.unpin')} placement="bottom">
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      unpinConversation();
                    }}
                  >
                    <Icon size={16} icon="pin-solid" />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: theme.spacing(2),
            }}
          >
            {conversationMessageWrapper ? (
              <ConversationListItemContent
                highlightedSearchKeyword={highlightedSearchKeyword}
                conversationMessageWrapper={conversationMessageWrapper}
              />
            ) : (
              <Box />
            )}
            <ConversationListItemStatusIcon
              conversationMessageWrapperStatus={
                conversationMessageWrapperStatus
              }
              channelType={conversationMessageWrapper?.getChannelType()}
              unreadMessageCount={unreadMessageCount}
            />
          </Box>
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: theme.spacing(2),
          }}
        >
          <TruncatedChipGroup>
            {labels?.map((label) => {
              return (
                <Chip
                  data-label-id={label.id}
                  data-label-text={label.name}
                  key={label.id}
                  label={label.name}
                  color={
                    LABELS_COLOR_MAPPING[
                      label.color as keyof typeof LABELS_COLOR_MAPPING
                    ]
                  }
                  {...(label.type === 'Shopify' && {
                    icon: <Icon icon="shopify" />,
                    color: 'lightGray',
                  })}
                />
              );
            })}
          </TruncatedChipGroup>
          <ConversationDropdown conversation={conversationProp} />
        </Box>
      </Stack>
    </ListItem>
  );
};

export default memo(ConversationListItem);
