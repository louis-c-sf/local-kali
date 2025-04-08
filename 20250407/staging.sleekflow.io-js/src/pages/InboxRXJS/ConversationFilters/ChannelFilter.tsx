import { Box, InputLabel, ListItemText, Stack } from '@mui/material';
import isHotkey from 'is-hotkey';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { ComboBox, ComboboxOption } from '@/components/ComboBox';
import Icon from '@/components/Icon';
import { MessagingChannel } from '@/services/companies/company.service';

import { useGetConversationsFilter } from '../hooks/useGetConversationsFilter';
import useMessagingChannels from '../hooks/useMessagingChannels';
import { useTypedPosthog } from '@/posthog/useTypedPosthog';

export default function ChannelFilter() {
  const { t } = useTranslation();
  const highlightedRef = useRef<string | null | undefined>(null);
  const posthog = useTypedPosthog();
  const { getConversationsFilter, setGetConversationsFilter } =
    useGetConversationsFilter();
  const { allMessagingChannels } = useMessagingChannels();

  const onChannelSelect = (channel: MessagingChannel) => {
    posthog.capture('inbox:select_inbox_search_filters_by_channels', {});
    const filteredChannelId = getConversationsFilter.channelIds?.[0];
    const channelIdentityId = getChannelIdentityId(channel);
    if (filteredChannelId === channelIdentityId) {
      setGetConversationsFilter({
        channelIds: [],
        channelType: undefined,
      });
      return;
    }

    setGetConversationsFilter({
      channelIds: [channelIdentityId!],
      channelType: channel.channelType,
    });
  };

  const getCheckboxState = (channel: MessagingChannel) => {
    const channelIdentityId = getChannelIdentityId(channel);
    return (
      (getConversationsFilter?.channelIds?.includes(channelIdentityId ?? '') ??
        false) &&
      getConversationsFilter.channelType === channel.channelType
    );
  };

  const getChannelIdentityId = (channel: MessagingChannel) => {
    let channelIdentityId = channel.channelIdentityId;
    if (channel.channelType === 'whatsapp') {
      channelIdentityId = channel.legacyChannelId;
    }
    if (
      channel.channelType === 'whatsapp360dialog' &&
      channel.legacyChannelId
    ) {
      channelIdentityId = channel.legacyChannelId;
    }
    if (channel.channelType === 'sms' && channel.legacyChannelId) {
      channelIdentityId = channel.legacyChannelId;
    }
    return channelIdentityId;
  };

  const getOption = (messagingChannel: MessagingChannel) => {
    return `${messagingChannel.channelType || ''}-${
      messagingChannel.channelIdentityId || ''
    }`;
  };

  return (
    <Box
      sx={{
        height: '100%',
        minWidth: '300px',
        padding: (theme) => theme.spacing(1, 0.5, 0, 1.5),
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <InputLabel>{t('inbox.conversations-list.filters.channels')}</InputLabel>
      <ComboBox
        listMode="fixed"
        onHighlightChange={(event, option) => {
          highlightedRef.current = option;
        }}
        slotProps={{
          list: {
            height: 320,
          },
          root: {
            onKeyDown: (e) => {
              if (isHotkey('Enter')(e)) {
                // manually override the default enter behaviour to achieve deselect option behaviour
                // @ts-expect-error - mui types are not updated
                e.defaultMuiPrevented = true;
                const selectedChannel = allMessagingChannels.find(
                  (x) => getOption(x) === highlightedRef.current,
                );
                if (selectedChannel) {
                  onChannelSelect(selectedChannel);
                }
              }
            },
          },
        }}
        itemKey={(index, options) => {
          return options[index]!;
        }}
        getOptionLabel={(option) => {
          const channel = allMessagingChannels.find(
            (x) => getOption(x) === option,
          );

          if (!channel) {
            return t('general.untitled-label');
          }
          return channel.channelDisplayName ?? t('general.untitled-label');
        }}
        value={
          getConversationsFilter?.channelIds
            ? getConversationsFilter?.channelIds[0] || ''
            : ''
        }
        renderOption={(props, optionValue) => {
          const channel = allMessagingChannels.find(
            (x) => getOption(x) === optionValue,
          );
          if (!channel) {
            return null;
          }

          return (
            <ComboboxOption
              key={optionValue}
              {...props}
              onClick={() => onChannelSelect(channel)}
              selected={getCheckboxState(channel)}
              sx={{ cursor: 'pointer' }}
            >
              <Stack spacing={1} direction="row">
                <Icon icon={channel.channelType} />
                <ListItemText
                  sx={(theme) => ({
                    ...theme.typography.ellipsis,
                  })}
                >
                  {channel.channelDisplayName}
                </ListItemText>
              </Stack>
            </ComboboxOption>
          );
        }}
        options={allMessagingChannels
          .sort((a, b) => {
            const selectedValue = getConversationsFilter?.channelIds?.[0];
            if (
              getChannelIdentityId(a) === selectedValue &&
              a.channelType === getConversationsFilter.channelType
            ) {
              return -1;
            }
            if (
              getChannelIdentityId(b) === selectedValue &&
              a.channelType === getConversationsFilter.channelType
            ) {
              return 1;
            }
            return 0;
          })
          .map((x) => getOption(x))}
      />
    </Box>
  );
}
