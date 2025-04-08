import { Box, Tab } from '@mui/material';
import { useInjection } from 'inversify-react';
import { useObservableState } from 'observable-hooks';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import ConversationListTabLabel from '@/pages/InboxRXJS/ConversationLists/ConversationListTabLabel';
import ConversationWithMessageList from '@/pages/InboxRXJS/ConversationLists/ConversationWithMessageList';
import ConversationWithUserProfileList from '@/pages/InboxRXJS/ConversationLists/ConversationWithUserProfileList';
import { Tabs } from '@/pages/InboxRXJS/Tabs';
import { useGetConversationsFilter } from '@/pages/InboxRXJS/hooks/useGetConversationsFilter';
import { SearchConversationWithMessageAndUserProfileDataSourceManager } from '@/services/conversations/search-conversation-with-message-and-user-profile-data-source-manager';
import { SearchConversationWithUserProfileDataSourceManager } from '@/services/conversations/search-conversation-with-user-profile-data-source-manager';
import { testIds } from '@/playwright/lib/test-ids';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface SearchConversationListsProps {}

const SearchConversationLists: React.FC<SearchConversationListsProps> = () => {
  const globalGetConversationsFilter = useGetConversationsFilter();
  const searchKeyword = globalGetConversationsFilter.searchKeyword;
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState('contacts');

  const searchConversationWithUserProfileDataSourceManager = useInjection(
    SearchConversationWithUserProfileDataSourceManager,
  );
  const [, totalNumOfUserProfiles$] = useMemo(() => {
    const input = {
      ...globalGetConversationsFilter.getConversationsFilter,
      searchKeyword,
    };
    const dataSource =
      searchConversationWithUserProfileDataSourceManager.getOrInitDataSource(
        input,
      );

    return [dataSource, dataSource.getTotalNumberOfItems$()];
  }, [
    globalGetConversationsFilter.getConversationsFilter,
    searchConversationWithUserProfileDataSourceManager,
    searchKeyword,
  ]);
  const totalNumOfUserProfiles = useObservableState(
    totalNumOfUserProfiles$,
    undefined,
  );

  const searchConversationWithMessageAndUserProfileDataSourceManager =
    useInjection(SearchConversationWithMessageAndUserProfileDataSourceManager);
  const [, totalNumOfMessages$] = useMemo(() => {
    const input = {
      ...globalGetConversationsFilter.getConversationsFilter,
      searchKeyword,
    };
    const dataSource =
      searchConversationWithMessageAndUserProfileDataSourceManager.getOrInitDataSource(
        input,
      );

    return [dataSource, dataSource.getTotalNumberOfItems$()];
  }, [
    globalGetConversationsFilter.getConversationsFilter,
    searchConversationWithMessageAndUserProfileDataSourceManager,
    searchKeyword,
  ]);
  const totalNumOfMessages = useObservableState(totalNumOfMessages$, undefined);

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
      <Tabs
        data-testid={testIds.inboxSearchConversationsFilterTab}
        variant="fullWidth"
        size={'large'}
        value={activeTab}
        sx={{
          borderBottom: '1px solid',
          flexShrink: 0,
          borderColor: (theme) => theme.palette.borderEnabled,
        }}
        onChange={(_, newValue) => setActiveTab(newValue)}
      >
        {[
          {
            label: (
              <ConversationListTabLabel
                label={t('inbox.conversation-list.people')}
                count={totalNumOfUserProfiles}
              />
            ),
            key: 'contacts',
          },
          {
            label: (
              <ConversationListTabLabel
                label={t('inbox.conversation-list.message')}
                count={totalNumOfMessages}
              />
            ),
            key: 'messages',
          },
        ].map(({ label, key }) => {
          return <Tab key={key} value={key} label={label} data-tab={key} />;
        })}
      </Tabs>

      <TabPanel value={activeTab} index="contacts">
        <ConversationWithUserProfileList
          getConversationsFilter={
            globalGetConversationsFilter.getConversationsFilter
          }
          searchKeyword={searchKeyword}
        />
      </TabPanel>
      <TabPanel value={activeTab} index="messages">
        <ConversationWithMessageList
          getConversationsFilter={
            globalGetConversationsFilter.getConversationsFilter
          }
          searchKeyword={searchKeyword}
        />
      </TabPanel>
    </Box>
  );
};

interface TabPanelProps {
  children: React.ReactNode;
  value: string;
  index: string;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      id={`tabpanel-${index}`}
      style={{
        display: value === index ? 'flex' : 'none',
        height: '100%',
        width: '100%',
      }}
    >
      <>{children}</>
    </div>
  );
};

export default React.memo(SearchConversationLists);
