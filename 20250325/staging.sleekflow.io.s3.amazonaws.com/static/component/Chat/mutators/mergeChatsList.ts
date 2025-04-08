import { ProfileType } from "../../../types/LoginType";
import { matchesConversationId } from "./chatSelectors";

export function mergeChatList(
  targetChats: ProfileType[],
  newChats: ProfileType[]
) {
  const onlyNewChats = newChats.filter(
    (nc) => !targetChats.some(matchesConversationId(nc.conversationId))
  );
  const updatedChats = newChats.filter((nc) =>
    targetChats.some(matchesConversationId(nc.conversationId))
  );
  const existingChats = targetChats.filter(
    (tc) => !newChats.some(matchesConversationId(tc.conversationId))
  );
  return [...existingChats, ...updatedChats, ...onlyNewChats];
}
