import { Action, LoginType } from "../../types/LoginType";
import produce from "immer";
import { matchesConversationId } from "../../component/Chat/mutators/chatSelectors";
import { initialUser } from "../../context/LoginContext";
import { WritableDraft } from "immer/dist/internal";

export const notificationReducer = (
  state: LoginType = initialUser,
  action: Action
) => {
  switch (action.type) {
    case "INBOX.INCREMENT_NOTIFICATIONS":
      return produce(state, (draft) => {
        const chat = draft.chats?.find(
          matchesConversationId(action.conversationId)
        );
        if (chat) {
          chat.unReadMsg = true;
        }
        if (draft.numOfNewMessages === undefined) {
          draft.numOfNewMessages = { [action.conversationId]: 1 };
        } else {
          if (isNaN(draft.numOfNewMessages[action.conversationId])) {
            draft.numOfNewMessages[action.conversationId] = 0;
          }
          draft.numOfNewMessages[action.conversationId] += 1;
        }
        if (action.badgeCounter) {
          draft.inbox.unreadMessagesCount = action.badgeCounter;
        } else {
          draft.inbox.unreadMessagesCount = getUnreadMessagesCount(draft);
        }
      });

    case "INBOX.UPDATE_NOTIFICATIONS_NUMBER":
      return produce(state, (draft) => {
        let total =
          action.summary.find((s) => s.type === "mentioned")?.count ?? 0;
        if (draft.user.id) {
          const userData = action.summary.find(
            (s) => s.assigneeId === draft.user.id
          );
          total += userData?.count ?? 0;
        }
        draft.inbox.unreadMessagesCount = total;
      });
    case "UPDATE_SELECTED_ASSIGNEE_CONVERSATIONS":
    case "UNREAD_STATUS_UPDATED":
    case "CHATS_RESET":
    case "CHATS_UPDATED":
    case "CHAT_SELECTED":
      return produce(state, (draft) => {
        draft.inbox.unreadMessagesCount = getUnreadMessagesCount(draft);
      });
  }

  return { ...state };
};

function getUnreadMessagesCount(state: WritableDraft<LoginType>) {
  const numOfNewMessages = state.numOfNewMessages;
  const chats = state.chats ?? [];
  const userId = state.user.id;
  const userChatIds = chats
    ?.filter((c) => c.assignee && c.assignee.id === userId)
    .map((c) => c.conversationId);
  if (numOfNewMessages === undefined) {
    return 0;
  }
  return userChatIds.reduce((acc, next) => {
    return acc + numOfNewMessages[next] ?? 0;
  }, 0);
}
