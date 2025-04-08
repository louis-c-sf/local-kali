import { createQueryKeys } from '@lukemorales/query-key-factory';
import type {
  ConversationAssignedToFilters,
  ConversationFilters,
  ConversationMessageFilters,
  ConversationsParams,
} from '../conversation';

export const conversationKeys = createQueryKeys('conversation', {
  conversationMessageByMessageUniqueID: (params: { messageID: string }) => [
    { ...params },
  ],
  conversationWithFiltering: (params: ConversationAssignedToFilters) => [
    { ...params },
  ],
  threadCountSummary: (params: ConversationFilters) => [{ ...params }],
  message: (
    params: ConversationMessageFilters,
    options: { type?: 'query' | 'infinite' } = {},
  ) => [params, options],
  unreadSummary: null,
  getConversationById: ({ conversationId }: { conversationId: string }) => [
    { conversationId },
  ],
  getUrlByFileId: ({ fileId }: { fileId: string }) => [{ fileId }],
  assigneeMenuItems: ({ conversationId }: { conversationId?: string }) => [
    { conversationId },
  ],
  conversations: (params: ConversationsParams) => [{ ...params }],
  summary: (params) => [{ ...params }],
  conversationTopControls: ({
    threadId,
    channelId,
  }: {
    threadId: string;
    channelId?: string | number;
  }) => [threadId, { channelId }],
  conversationSearch: (params) => [{ ...params }],
  conversationSearchCount: (params) => [{ ...params }],
  isConversationAccessibleKey: (params: { conversationId: string }) => [
    { ...params },
  ],
  mediaMimeTypeKey: (url: string) => [url],
});
