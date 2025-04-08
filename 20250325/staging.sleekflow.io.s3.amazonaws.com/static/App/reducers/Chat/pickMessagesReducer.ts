import { LoginType, Action } from "../../../types/LoginType";
import { initialUser } from "../../../context/LoginContext";
import produce from "immer";
import MessageType from "../../../types/MessageType";

export function pickMessagesReducer(
  state: LoginType = initialUser,
  action: Action
): LoginType {
  return produce(state, (draft) => {
    const { pickingMessages, quote } = draft.inbox;

    switch (action.type) {
      case "INBOX.MESSAGE.PICKED":
        if (action.mode) {
          pickingMessages.mode = action.mode;
        }
        pickingMessages.active = true;
        pickingMessages.pickedIds.push(action.messageId);
        quote.id = null;
        break;
      case "INBOX.MESSAGE.UNPICKED":
        pickingMessages.pickedIds = pickingMessages.pickedIds.filter(
          (id) => id !== action.messageId
        );
        if (pickingMessages.pickedIds.length === 0) {
          pickingMessages.mode = undefined;
          pickingMessages.active = false;
        }
        break;
      case "INBOX.MESSAGE.PICK_HIDDEN":
        pickingMessages.pickedIds = [];
        break;
      case "INBOX.MESSAGE.PICK_RESET":
        pickingMessages.mode = undefined;
        pickingMessages.active = false;
        break;
      case "INBOX.MESSAGE.FORWARD_ENDED":
      case "INBOX.MESSAGE.DELETE_ENDED":
        pickingMessages.pickedIds = pickingMessages.pickedIds.filter(
          (id) => !action.messageIds.includes(id)
        );
        if (pickingMessages.pickedIds.length === 0) {
          pickingMessages.mode = undefined;
          pickingMessages.active = false;
        }
        // update deleted status immediately
        if (action.type === "INBOX.MESSAGE.DELETE_ENDED") {
          draft.messagesMemoized
            .filter((m: MessageType) => action.messageIds.includes(m.id))
            .forEach((m: MessageType) => (m.status = "Deleted"));
        }
        break;

      case "INBOX.MESSAGE.REPLY_SELECTED":
        quote.id = action.messageId;
        quote.show = true;
        break;

      case "INBOX.MESSAGE.REPLY_DESELECTED":
        quote.show = false;
        break;

      case "INBOX.MESSAGE.REPLY_HIDDEN":
        // erase text after hide animation finished
        quote.id = null;
        break;

      case "UPDATE_SELECTED_CHAT":
        quote.id = null;
        quote.show = false;
        break;

      case "CHAT_SELECTED":
        quote.id = null;
        quote.show = false;
        pickingMessages.pickedIds = [];
        pickingMessages.active = false;
        break;
    }
  });
}
