import { useAppSelector } from "../../../AppRootContext";
import { getLatestChatMessage } from "../mutators/chatSelectors";
import { ProfileType } from "../../../types/LoginType";
import MessageType from "../../../types/MessageType";

export function useLatestMessageTimestamp(defaultValue: number) {
  return useAppSelector((s) =>
    (s.chats ?? []).reduce((acc, next) => {
      const latestTimestamp = getLatestChatTimestamp(next, s.messagesMemoized);
      if (latestTimestamp) {
        return Math.max(latestTimestamp, acc);
      }
      return acc;
    }, defaultValue)
  );
}

export function getLatestChatTimestamp(
  chat: ProfileType,
  messagesMemoized: MessageType[]
) {
  const latestChatMessage = getLatestChatMessage(chat.conversationId, [
    ...messagesMemoized,
    ...(chat.conversation?.list ?? []),
  ]);
  return latestChatMessage?.timestamp;
}
