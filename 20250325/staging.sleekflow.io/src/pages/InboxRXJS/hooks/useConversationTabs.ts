import { useInjection } from 'inversify-react';
import { useCallback, useMemo, useTransition } from 'react';
import { useSearchParams } from 'react-router-dom';
import { combineLatest } from 'rxjs';

import { MyConversationInputViewModelManager } from '@/services/conversation-inputs/my-conversation-input-view-model-manager';
import { ConversationTabService } from '@/services/persistences/conversation-tab-service';
import { ConversationTab } from '@/services/persistences/sf-dexie';
import { useObservableEagerState } from '@/hooks/useObservableEagerState';

const useConversationTabs = () => {
  const [isPending, startTransition] = useTransition();
  const [searchParams, setSearchParams] = useSearchParams();
  const conversationTabService = useInjection(ConversationTabService);
  const myConversationInputViewModelManager = useInjection(
    MyConversationInputViewModelManager,
  );

  const conversationTabsAndActiveConversationTab$ = useMemo(() => {
    return combineLatest([
      conversationTabService.getConversationTabs$(),
      conversationTabService.getActiveConversationTab$(),
    ]);
  }, [conversationTabService]);
  const [conversationTabs, activeConversationTab] = useObservableEagerState(
    conversationTabsAndActiveConversationTab$,
    [[], null],
  );
  const activeConversationTabConversationId =
    searchParams.get('conversationId') || searchParams.get('threadId');

  const handleSearchParams = useCallback(
    (conversationId: string | null) => {
      setSearchParams(
        (prev) => {
          if (conversationId) {
            prev.set('conversationId', conversationId);
          } else {
            prev.delete('conversationId');
          }

          prev.delete('threadId');
          return prev;
        },
        {
          replace: true,
        },
      );
    },
    [setSearchParams],
  );

  const removeTab = useCallback(
    async (conversationId: string) => {
      const newActiveConversationTab =
        await conversationTabService.removeConversationTab(conversationId);
      handleSearchParams(
        newActiveConversationTab
          ? newActiveConversationTab.conversationId
          : null,
      );
    },
    [conversationTabService, handleSearchParams],
  );

  const selectTab = useCallback(
    async (conversationId: string) => {
      startTransition(() => {
        handleSearchParams(conversationId);

        conversationTabService
          .selectConversationTab(conversationId, {
            conversationId,
            userProfileId: 'userProfileId',
            lastSelectedDate: new Date(),
            createdAt: new Date(),
            active: true,
          })
          .then(() => {
            myConversationInputViewModelManager.resetConversationSelectedInputChannel(
              conversationId,
            );
          });
      });
    },
    [
      conversationTabService,
      handleSearchParams,
      myConversationInputViewModelManager,
    ],
  );

  const addTab = useCallback(
    async (conversationTab: ConversationTab) => {
      startTransition(() => {
        handleSearchParams(conversationTab.conversationId);
        conversationTabService.addConversationTab(conversationTab).then(() => {
          myConversationInputViewModelManager.resetConversationSelectedInputChannel(
            conversationTab.conversationId,
          );
        });
      });
    },
    [
      conversationTabService,
      handleSearchParams,
      myConversationInputViewModelManager,
    ],
  );

  const clearTabs = useCallback(async () => {
    await conversationTabService.clearConversationTabs();
    handleSearchParams(null);
  }, [conversationTabService, handleSearchParams]);

  return {
    activeConversationTabConversationId,
    activeConversationTab,
    conversationTabs: conversationTabs,
    removeTab,
    selectTab,
    addTab,
    clearTabs,
    isPending,
  };
};

export default useConversationTabs;
