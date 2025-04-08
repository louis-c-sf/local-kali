import { testIds } from '@/playwright/lib/test-ids';
import { useInjection } from 'inversify-react';
import { useObservableEagerState } from 'observable-hooks';
import React, { useMemo, useRef } from 'react';
import { useIsomorphicLayoutEffect } from 'react-use';
import { Subject } from 'rxjs';

import ConversationListEmptyResult from '@/pages/InboxRXJS/ConversationLists/ConversationListEmptyResult';
import { getConversationListItemKey } from '@/pages/InboxRXJS/ConversationLists/ConversationListItem/ConversationListItem';
import { VirtualizedConversationListItem } from '@/pages/InboxRXJS/ConversationLists/ConversationListItem/getConversationVirtualListItem';
import ConversationListSkeleton from '@/pages/InboxRXJS/ConversationLists/ConversationListSkeleton';
import { ConversationWithUserProfileDataSourceManager } from '@/services/conversations/conversation-with-user-profile-data-source-manager';
import { GetConversationsFilter } from '@/services/conversations/models/get-conversations-filter';
import { DataSourceListRange } from '@/services/data-sources/models/data-source-list-range';
import { Virtualizer } from 'virtua';
import { ScrollArea } from '../../../components/ScrollArea/ScrollArea';

interface MainConversationListProps {
  getConversationsFilter: GetConversationsFilter;
}

const MainConversationList: React.FC<MainConversationListProps> = ({
  getConversationsFilter,
}) => {
  const conversationWithUserProfileDataSourceManager = useInjection(
    ConversationWithUserProfileDataSourceManager,
  );

  const [
    ,
    conversationWithUserProfileResults$,
    isInitializing$,
    hasNextPage$,
    virtualizerListRange$$,
  ] = useMemo(() => {
    const _virtualizerListRange$$ = new Subject<DataSourceListRange>();

    const dataSource =
      conversationWithUserProfileDataSourceManager.getOrInitDataSource(
        getConversationsFilter,
      );

    return [
      dataSource,
      dataSource.setupAndGet$(getConversationsFilter, _virtualizerListRange$$),
      dataSource.getIsInitializing$(),
      dataSource.getHasNextPage$(),
      _virtualizerListRange$$,
    ];
  }, [conversationWithUserProfileDataSourceManager, getConversationsFilter]);

  const conversationWithUserProfileResults = useObservableEagerState(
    conversationWithUserProfileResults$,
  );

  const isInitializing = useObservableEagerState(isInitializing$);
  const hasNextPage = useObservableEagerState(hasNextPage$);

  const ref = useRef<HTMLDivElement | null>(null);
  const scrollPositionBeforeFetch = useRef<number | null>(null);

  // maintain scroll position when inserting new items, so that the user doesn't lose their place
  useIsomorphicLayoutEffect(() => {
    if (ref.current && scrollPositionBeforeFetch.current) {
      ref.current.scrollTop = scrollPositionBeforeFetch.current;
      scrollPositionBeforeFetch.current = null;
    }
  }, [conversationWithUserProfileResults]);

  if (isInitializing) {
    return <ConversationListSkeleton />;
  }

  if (conversationWithUserProfileResults.length === 0) {
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
        end: conversationWithUserProfileResults.length - 1,
      });
    }
  };

  return (
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
        {conversationWithUserProfileResults.map(
          ({ conversation, userProfile }) => (
            <VirtualizedConversationListItem
              key={getConversationListItemKey({
                conversationId: conversation.getId(),
                userProfileId: userProfile.getId(),
              })}
              conversation={conversation}
              userProfile={userProfile}
            />
          ),
        )}
      </Virtualizer>
      {hasNextPage && <ConversationListSkeleton />}
    </ScrollArea>
  );
};

export default React.memo(MainConversationList);
