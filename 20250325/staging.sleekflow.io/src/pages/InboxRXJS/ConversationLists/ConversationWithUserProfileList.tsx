import React, { useRef } from 'react';

import { ScrollArea } from '@/components/ScrollArea';
import ConversationListEmptyResult from '@/pages/InboxRXJS/ConversationLists/ConversationListEmptyResult';
import { getConversationListItemKey } from '@/pages/InboxRXJS/ConversationLists/ConversationListItem/ConversationListItem';
import { VirtualizedConversationListItem } from '@/pages/InboxRXJS/ConversationLists/ConversationListItem/getConversationVirtualListItem';
import ConversationListSkeleton from '@/pages/InboxRXJS/ConversationLists/ConversationListSkeleton';
import useSearchConversationWIthUserProfile from '@/pages/InboxRXJS/hooks/useSearchConversationWIthUserProfile';
import { testIds } from '@/playwright/lib/test-ids';
import { GetConversationsFilter } from '@/services/conversations/models/get-conversations-filter';
import { Stack } from '@mui/material';
import { Virtualizer } from 'virtua';

interface ConversationWithUserProfileListProps {
  getConversationsFilter: GetConversationsFilter;
  searchKeyword: string;
}

const ConversationWithUserProfileList: React.FC<
  ConversationWithUserProfileListProps
> = ({ getConversationsFilter, searchKeyword }) => {
  const {
    isInitializing,
    hasNextPage,
    searchConversationWithUserProfileResults,
    virtualizerListRange$$,
  } = useSearchConversationWIthUserProfile({
    getConversationsFilter,
    searchKeyword,
  });

  const ref = useRef<HTMLDivElement | null>(null);
  const scrollPositionBeforeFetch = useRef<number | null>(null);

  if (isInitializing) {
    return <ConversationListSkeleton />;
  }

  if (searchConversationWithUserProfileResults.length === 0) {
    return <ConversationListEmptyResult />;
  }

  const handleScroll: React.UIEventHandler<HTMLDivElement> = (e) => {
    if (!hasNextPage) return;

    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    scrollPositionBeforeFetch.current = scrollTop;

    // Check if user has scrolled near the loading skeleton
    const scrollThreshold = 800;
    const isNearBottom =
      scrollHeight - scrollTop - clientHeight < scrollThreshold;

    if (isNearBottom) {
      virtualizerListRange$$.next({
        start: 0,
        end: searchConversationWithUserProfileResults.length - 1,
      });
    }
  };

  return (
    <Stack width="100%">
      <ScrollArea
        data-testid={testIds.inboxSearchConversationList}
        slotProps={{
          root: {
            style: {
              height: 0, // needed for scrolling
              flex: '1 1 auto',
            },
          },
          viewport: {
            ref,
            style: { listStyle: 'none' },
            onScroll: handleScroll,
          },
        }}
      >
        <Virtualizer scrollRef={ref} overscan={20}>
          {searchConversationWithUserProfileResults.map(
            ({ conversation, userProfile }) => (
              <VirtualizedConversationListItem
                key={getConversationListItemKey({
                  conversationId: conversation.getId(),
                  userProfileId: userProfile?.getId(),
                })}
                conversation={conversation}
                userProfile={userProfile}
              />
            ),
          )}
        </Virtualizer>
        {hasNextPage && <ConversationListSkeleton />}
      </ScrollArea>
    </Stack>
  );
};

export default React.memo(ConversationWithUserProfileList);
