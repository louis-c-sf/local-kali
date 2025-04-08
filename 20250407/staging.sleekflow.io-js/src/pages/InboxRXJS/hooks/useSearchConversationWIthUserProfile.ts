import { useInjection } from 'inversify-react';
import { useMemo } from 'react';
import { Subject } from 'rxjs';

import { GetConversationsFilter } from '@/services/conversations/models/get-conversations-filter';
import { SearchConversationWithUserProfileDataSourceManager } from '@/services/conversations/search-conversation-with-user-profile-data-source-manager';
import { DataSourceListRange } from '@/services/data-sources/models/data-source-list-range';
import { useObservableEagerState } from '@/hooks/useObservableEagerState';

export default function useSearchConversationWIthUserProfile({
  getConversationsFilter,
  searchKeyword,
}: {
  searchKeyword: string;
  getConversationsFilter: GetConversationsFilter;
}) {
  const searchConversationWithUserProfileDataSourceManager = useInjection(
    SearchConversationWithUserProfileDataSourceManager,
  );

  const [
    ,
    searchConversationWithUserProfileResults$,
    isInitializing$,
    totalNumberOfItems$,
    hasNextPage$,
    virtualizerListRange$$,
  ] = useMemo(() => {
    const _virtualizerListRange$$ = new Subject<DataSourceListRange>();
    const input = {
      ...getConversationsFilter,
      searchKeyword,
    };
    const dataSource =
      searchConversationWithUserProfileDataSourceManager.getOrInitDataSource(
        input,
      );

    return [
      dataSource,
      dataSource.setupAndGet$(input, _virtualizerListRange$$),
      dataSource.getIsInitializing$(),
      dataSource.getTotalNumberOfItems$(),
      dataSource.getHasNextPage$(),
      _virtualizerListRange$$,
    ];
  }, [
    searchConversationWithUserProfileDataSourceManager,
    getConversationsFilter,
    searchKeyword,
  ]);
  const searchConversationWithUserProfileResults = useObservableEagerState(
    searchConversationWithUserProfileResults$,
    [],
  );
  const totalNumberOfItems = useObservableEagerState(totalNumberOfItems$, 0);
  const isInitializing = useObservableEagerState(isInitializing$, false);
  const hasNextPage = useObservableEagerState(hasNextPage$, true);

  return {
    virtualizerListRange$$,
    isInitializing,
    searchConversationWithUserProfileResults,
    totalNumberOfItems,
    hasNextPage,
  };
}
