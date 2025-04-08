import { Stack } from '@mui/material';
import { useInjection } from 'inversify-react';
import React, { useMemo, useRef } from 'react';
import { useIsomorphicLayoutEffect } from 'react-use';
import { Subject } from 'rxjs';
import { Virtualizer } from 'virtua';

import { ScrollArea } from '@/components/ScrollArea';
import { useObservableEagerState } from '@/hooks/useObservableEagerState';
import ConversationListEmptyResult from '@/pages/InboxRXJS/ConversationLists/ConversationListEmptyResult';
import { getConversationListItemKey } from '@/pages/InboxRXJS/ConversationLists/ConversationListItem/ConversationListItem';
import { VirtualizedConversationListItem } from '@/pages/InboxRXJS/ConversationLists/ConversationListItem/getConversationVirtualListItem';
import ConversationListSkeleton from '@/pages/InboxRXJS/ConversationLists/ConversationListSkeleton';
import { testIds } from '@/playwright/lib/test-ids';
import { GetConversationsFilter } from '@/services/conversations/models/get-conversations-filter';
import { SearchConversationWithMessageAndUserProfileDataSourceManager } from '@/services/conversations/search-conversation-with-message-and-user-profile-data-source-manager';
import { DataSourceListRange } from '@/services/data-sources/models/data-source-list-range';

interface ConversationWithMessageListProps {
  getConversationsFilter: GetConversationsFilter;
  searchKeyword: string;
}

const ConversationWithMessageList: React.FC<
  ConversationWithMessageListProps
> = ({ getConversationsFilter, searchKeyword }) => {
  const searchConversationWithMessageAndUserProfileDataSourceManager =
    useInjection(SearchConversationWithMessageAndUserProfileDataSourceManager);

  const [
    ,
    searchConversationWithMessageAndUserProfileResults$,
    isInitializing$,
    hasNextPage$,
    virtualizerListRange$$,
  ] = useMemo(() => {
    const _virtualizerListRange$$ = new Subject<DataSourceListRange>();
    const input = {
      ...getConversationsFilter,
      searchKeyword,
    };
    const dataSource =
      searchConversationWithMessageAndUserProfileDataSourceManager.getOrInitDataSource(
        input,
      );

    return [
      dataSource,
      dataSource.setupAndGet$(input, _virtualizerListRange$$),
      dataSource.getIsInitializing$(),
      dataSource.getHasNextPage$(),
      _virtualizerListRange$$,
    ];
  }, [
    searchConversationWithMessageAndUserProfileDataSourceManager,
    getConversationsFilter,
    searchKeyword,
  ]);
  const searchConversationWithMessageAndUserProfileResults =
    useObservableEagerState(
      searchConversationWithMessageAndUserProfileResults$,
      [],
    );
  const isInitializing = useObservableEagerState(isInitializing$, false);
  const hasNextPage = useObservableEagerState(hasNextPage$, true);

  const ref = useRef<HTMLDivElement | null>(null);
  const scrollPositionBeforeFetch = useRef<number | null>(null);

  // maintain scroll position when inserting new items, so that the user doesn't lose their place
  useIsomorphicLayoutEffect(() => {
    if (ref.current && scrollPositionBeforeFetch.current) {
      ref.current.scrollTop = scrollPositionBeforeFetch.current;
      scrollPositionBeforeFetch.current = null;
    }
  }, [searchConversationWithMessageAndUserProfileResults]);

  if (isInitializing) {
    return <ConversationListSkeleton />;
  }

  if (searchConversationWithMessageAndUserProfileResults.length === 0) {
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
        end: searchConversationWithMessageAndUserProfileResults.length - 1,
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
          {searchConversationWithMessageAndUserProfileResults.map(
            ({ conversation, userProfile, message }) => (
              <VirtualizedConversationListItem
                key={getConversationListItemKey({
                  conversationId: conversation.getId(),
                  userProfileId: userProfile?.getId(),
                })}
                conversation={conversation}
                userProfile={userProfile}
                message={message}
              />
            ),
          )}
        </Virtualizer>
        {hasNextPage && <ConversationListSkeleton />}
      </ScrollArea>
    </Stack>
  );
};

export default React.memo(ConversationWithMessageList);
