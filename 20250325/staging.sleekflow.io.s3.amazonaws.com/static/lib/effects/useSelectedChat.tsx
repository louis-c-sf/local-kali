import {
  matchesConversationId,
  getLatestMessage,
  isNoteOrMatchingChannel,
} from "../../component/Chat/mutators/chatSelectors";
import { useAppSelector } from "../../AppRootContext";
import { uniqBy, pipe, filter, T, allPass, equals } from "ramda";
import MessageType from "../../types/MessageType";
import { isProxyMessage } from "../../component/Chat/mutators/mergeMessages";
import { InboxStateType } from "../../types/state/InboxStateType";
import { getChannelId } from "component/Chat/utils/useChatSelectors";
import { sortedFromOldest } from "../../component/Chat/mutators/sortedFromOldest";
import { LoginType } from "types/LoginType";

function uniqueComparator(a: MessageType) {
  return isProxyMessage(a) && a.isSentFromSleekflow
    ? a.messageUniqueID || a.id
    : a.id;
}

function getChannelMatcher(filterSelected: InboxStateType["messagesFilter"]) {
  const channelMatcher = filterSelected.channelName
    ? isNoteOrMatchingChannel(
        filterSelected.channelName,
        filterSelected.channelId ?? undefined
      )
    : T;
  return channelMatcher;
}

function getConversationMessagesSelector(
  matchers: Array<(m: MessageType) => boolean>
) {
  return pipe(
    filter<MessageType, "array">(allPass(matchers)),
    uniqBy(uniqueComparator),
    sortedFromOldest
  );
}

function useSelectedChat(conversationId?: string) {
  const selectedChatMessages = useAppSelector((s) => {
    if (!conversationId) {
      return [];
    }
    const selector = getConversationMessagesSelector([
      matchesConversationId<MessageType>(conversationId),
      getChannelMatcher(s.inbox.messagesFilter),
    ]);

    return selector(s.messagesMemoized);
  }, equals);

  function getConversationChannelMessagesSelector(
    s: LoginType,
    extraMatcher: (m: MessageType) => boolean
  ) {
    if (!conversationId) {
      return [];
    }
    const channelName =
      s.selectedChannelFromConversation ?? s.profile.lastChannel;
    const selector = getConversationMessagesSelector([
      matchesConversationId<MessageType>(conversationId),
      extraMatcher,
      getChannelMatcher({
        channelName: channelName,
        channelId: (getChannelId(channelName, s.profile) as string) || null,
        selectedFrom: "filter",
      }),
    ]);
    return selector(s.messagesMemoized);
  }

  const latestCustomerMessage = useAppSelector((s) => {
    const allCustomerMessages = getConversationChannelMessagesSelector(
      s,
      (m) => !m.isSentFromSleekflow && !m.isFromImport
    );
    return getLatestMessage(allCustomerMessages);
  }, equals);

  const latestSystemMessage = useAppSelector((s) => {
    const allSystemMessages = getConversationChannelMessagesSelector(
      s,
      (m) => m.isSentFromSleekflow
    );
    return getLatestMessage(allSystemMessages);
  }, equals);

  return {
    selectedChatMessages,
    latestCustomerMessage: latestCustomerMessage,
    latestSystemMessage: latestSystemMessage,
  };
}

export default useSelectedChat;
