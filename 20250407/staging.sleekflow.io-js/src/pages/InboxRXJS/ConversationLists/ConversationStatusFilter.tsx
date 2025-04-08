import { MenuItem, Select } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { formatNumber } from '@/i18n/number/formatNumber';
import useConversationSummary from '@/pages/InboxRXJS/hooks/useConversationSummary';
import { useGetConversationsFilter } from '@/pages/InboxRXJS/hooks/useGetConversationsFilter';
import { testIds } from '@/playwright/lib/test-ids';

export default function ConversationStatusFilter() {
  const globalGetConversationsFilter = useGetConversationsFilter();
  const conversationSummary = useConversationSummary(
    globalGetConversationsFilter.getConversationsFilter,
  );

  const { t } = useTranslation();

  const options = [
    {
      key: 'open',
      label:
        conversationSummary.open.total === undefined
          ? t('inbox.conversation-list.status.open-loading')
          : t('inbox.conversation-list.status.open', {
              amount: formatNumber(conversationSummary.open.total),
            }),
    },
    {
      key: 'pending',
      label:
        conversationSummary.pending.total === undefined
          ? t('inbox.conversation-list.status.snooze-loading')
          : t('inbox.conversation-list.status.snooze', {
              amount: formatNumber(conversationSummary.pending.total),
            }),
    },
    {
      key: 'closed',
      label:
        conversationSummary.closed.total === undefined
          ? t('inbox.conversation-list.status.closed-loading')
          : t('inbox.conversation-list.status.closed', {
              amount: formatNumber(conversationSummary.closed.total),
            }),
    },
    {
      key: 'all',
      label:
        conversationSummary.closed.total === undefined
          ? t('inbox.conversation-list.status.all-loading', 'All')
          : t('inbox.conversation-list.status.all', {
              defaultValue: 'All ( {amount} )',
              amount: formatNumber(conversationSummary.all?.total),
            }),
    },
  ];

  return (
    <Select
      data-testid={testIds.inboxConversationsStatusFilterButton}
      variant="standard"
      value={
        globalGetConversationsFilter.getConversationsFilter.status || 'all'
      }
      onChange={(e) => {
        globalGetConversationsFilter.setGetConversationsFilter({
          status: e.target.value as string,
        });
      }}
      sx={[
        (theme) => ({
          '&.MuiInputBase-root': {
            height: '47px',
            borderBottom: '1px solid',
            borderColor: theme.palette.divider,
            background: theme.palette.blue[5],
            borderRadius: 0,
            boxShadow: 'none',
            '.MuiSelect-select': {
              padding: '14px 12px',
            },
            '.MuiOutlinedInput-notchedOutline': {
              border: 'none',
              boxShadow: 'none',
            },
            '&.Mui-focused fieldset': {
              border: 'none',
              boxShadow: 'none',
            },
          },
        }),
      ]}
    >
      {options.map(({ label, key }) => {
        return (
          <MenuItem key={key} value={key} data-status={key}>
            {label}
          </MenuItem>
        );
      })}
    </Select>
  );
}
