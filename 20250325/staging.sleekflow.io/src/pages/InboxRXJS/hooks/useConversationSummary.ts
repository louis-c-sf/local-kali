import { useObservableState } from 'observable-hooks';
import { useMemo } from 'react';

import { useDataSource } from '@/hooks/useDataSource';
import { ConversationSummaryDataSourceManager } from '@/services/conversations/conversation-summary-data-source-manager';
import { GetConversationsFilter } from '@/services/conversations/models/get-conversations-filter';

export default function useConversationSummary(
  getConversationsFilter: GetConversationsFilter,
) {
  const [dataSource] = useDataSource(
    ConversationSummaryDataSourceManager,
    getConversationsFilter,
  );

  const conversationSummary$ = useMemo(
    () => dataSource.setupAndGet$(getConversationsFilter),
    [dataSource, getConversationsFilter],
  );

  const conversationSummary = useObservableState(conversationSummary$, {
    open: {},
    pending: {},
    closed: {},
    all: {},
  });

  return conversationSummary;
}
