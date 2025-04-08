import { useInjection } from 'inversify-react';
import { useRenderThrow } from 'observable-hooks';
import { useMemo } from 'react';
import { catchError, filter, map, of } from 'rxjs';

import { ConversationService } from '@/services/conversations/conversation.service';
import { ConversationWrapper } from '@/services/conversations/managers/conversation-wrapper';
import { useObservableEagerState } from '@/hooks/useObservableEagerState';

const useConversation = (
  {
    conversationId,
  }: {
    conversationId: string;
  },
  options?: { onError?: (error: any) => void },
) => {
  const conversationService = useInjection(ConversationService);
  const conversation$ = useMemo(() => {
    return conversationService.getConversationWrapper$(conversationId).pipe(
      catchError((err) => {
        options?.onError?.(err);
        return of(undefined);
      }),
      filter((x) => x !== undefined),
      map((x) => x!),
    );
  }, [conversationService, conversationId, options]);
  const conversationWithError$ = useRenderThrow(conversation$);

  const loadingWrapper = ConversationWrapper.initializing();
  const conversationWrapper = useObservableEagerState(
    conversationWithError$,
    loadingWrapper,
  );

  if (!conversationId) {
    return loadingWrapper;
  }

  return conversationWrapper;
};

export default useConversation;
