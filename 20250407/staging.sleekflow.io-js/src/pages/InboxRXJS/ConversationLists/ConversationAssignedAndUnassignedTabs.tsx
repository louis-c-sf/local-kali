import { Tab, TabsProps } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { formatNumber } from '@/i18n/number/formatNumber';
import ConversationListTabLabel from '@/pages/InboxRXJS/ConversationLists/ConversationListTabLabel';
import { Tabs } from '@/pages/InboxRXJS/Tabs';
import useConversationSummary from '@/pages/InboxRXJS/hooks/useConversationSummary';
import { ConversationSummaryStatus } from '@/services/conversations/models/conversation-summary';
import { GetConversationsFilter } from '@/services/conversations/models/get-conversations-filter';
import { testIds } from '@/playwright/lib/test-ids';

export default function ConversationAssignedAndUnassignedTabs({
  getConversationsFilter,
  ...rest
}: TabsProps & {
  getConversationsFilter: GetConversationsFilter;
}) {
  const { t } = useTranslation();
  const conversationSummary = useConversationSummary(getConversationsFilter);
  const assignedCount = getConversationsFilter.status
    ? conversationSummary?.[
        getConversationsFilter.status! as ConversationSummaryStatus
      ]?.assigned
    : undefined;
  const unassignedCount = getConversationsFilter.status
    ? conversationSummary?.[
        getConversationsFilter.status! as ConversationSummaryStatus
      ]?.unassignedCount
    : undefined;
  return (
    <Tabs
      variant="fullWidth"
      sx={{
        borderBottom: '1px solid',
        flexShrink: 0,
        borderColor: (theme) => theme.palette.borderEnabled,
      }}
      {...rest}
    >
      {[
        {
          'data-testid': testIds.inboxAssignedTab,
          label: (
            <ConversationListTabLabel
              label={t('inbox.conversation-list.assigned-tab', {
                defaultValue: 'Assigned',
              })}
              count={formatNumber(assignedCount)}
            />
          ),
          key: 'assigned',
        },
        {
          'data-testid': testIds.inboxUnassignedTab,
          label: (
            <ConversationListTabLabel
              label={t('inbox.conversation-list.unassigned-tab', {
                defaultValue: 'Unassigned',
              })}
              count={formatNumber(unassignedCount)}
            />
          ),
          key: 'unassigned',
        },
      ].map(({ label, key, ...rest }) => {
        return (
          <Tab
            iconPosition="bottom"
            key={key}
            value={key}
            label={label}
            {...rest}
          />
        );
      })}
    </Tabs>
  );
}
