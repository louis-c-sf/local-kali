import useSelectedChat from "../../../lib/effects/useSelectedChat";
import { useAppSelector } from "../../../AppRootContext";
import { sortedFromOldest } from "../mutators/sortedFromOldest";

export function useOldestMessageTimestamp() {
  const currentChatId = useAppSelector((s) => s.profile.conversationId);
  let { selectedChatMessages } = useSelectedChat(currentChatId);
  if (selectedChatMessages.length > 0) {
    const [firstMessage] = sortedFromOldest(selectedChatMessages);
    if (firstMessage) {
      return firstMessage.timestamp;
    }
  }
  return undefined;
}
