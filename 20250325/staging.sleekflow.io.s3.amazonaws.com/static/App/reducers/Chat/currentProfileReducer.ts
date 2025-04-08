import { LoginType, Action } from "../../../types/LoginType";
import { initialUser } from "../../../context/LoginContext";
import produce from "immer";
import MessageType from "../../../types/MessageType";
import {
  matchingMessage,
  mergeMessages,
} from "../../../component/Chat/mutators/mergeMessages";
import {
  getLatestChatMessage,
  matchesConversationId,
} from "../../../component/Chat/mutators/chatSelectors";
import { defaultAssigee } from "../../../types/state/inbox/AssigneeType";

export function currentProfileReducer(
  state: LoginType = initialUser,
  action: Action
): LoginType {
  return produce(state, (draft) => {
    switch (action.type) {
      case "CHAT_ADD_TAG_FILTER":
      case "CHAT_ADD_UNREAD_FILTER":
      case "CHAT_REMOVE_UNREAD_FILTER":
      case "CHAT_REMOVE_TAG_FILTER":
        draft.profile = defaultAssigee.conversations[0];
        break;
      case "CHATS_RESET":
      case "RESET_PROFILE":
      case "CLEAR_PROFILE":
      case "PROFILE_SELECTED":
      case "ASSIGNEE_ID_SELECTED":
        draft.selectedChannelFromConversation = undefined;
        draft.selectedChannelIdFromConversation = undefined;
        break;

      case "INBOX.SYNC.MISSING_MESSAGES_RELOADED":
        const missingMessages = action.messages.filter(
          (msg: MessageType) =>
            !draft.messagesMemoized.some(matchingMessage(msg))
        );

        draft.messagesMemoized = mergeMessages(
          draft.messagesMemoized,
          missingMessages
        );
        if (draft.inbox.unreadMessagesCount === undefined) {
          draft.inbox.unreadMessagesCount = 0;
        }
        for (const chat of draft.chats ?? []) {
          const allChatMessages = [
            ...draft.messagesMemoized,
            ...(chat.conversation?.list ?? []),
          ];
          const latestMessageChannel = getLatestChatMessage(
            chat.conversationId,
            allChatMessages.filter(
              (m: MessageType) => m.channel?.toLowerCase() !== "note"
            )
          )?.channel;
          if (latestMessageChannel) {
            chat.lastChannel = latestMessageChannel;
          }

          const latestMsg = getLatestChatMessage(
            chat.conversationId,
            allChatMessages
          );
          if (latestMsg && chat.conversation) {
            chat.conversation.lastUpdated = latestMsg.createdAt;
          }

          const numOfNewMessageAdded = missingMessages.filter(
            matchesConversationId(chat.conversationId)
          ).length;
          chat.numOfNewMessage = numOfNewMessageAdded;
          draft.inbox.unreadMessagesCount += numOfNewMessageAdded;
        }
        draft.isScrollToEnd = true;
        break;
    }
  });
}
