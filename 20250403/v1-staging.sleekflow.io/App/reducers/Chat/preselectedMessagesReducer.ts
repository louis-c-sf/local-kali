import { createMessagesContextScrollReducer } from "./createMessagesContextScrollReducer";
import { reduceReducersWithDefaults } from "../../../utility/reduce-reducers";
import produce from "immer";
import { LoginType, Action } from "../../../types/LoginType";
import { initialUser } from "../../../context/LoginContext";
import { contextMessagesInit } from "../../../types/state/inbox/MessageSearchType";

const preselectReducer = produce(
  (draft: LoginType = initialUser, action: Action) => {
    switch (action.type) {
      case "INBOX.MESSAGE.PRESELECTED_CONTEXT_LOADED":
        if (action.highlight) {
          draft.inbox.preselectedMessage.highlight = action.highlight;
        }
        break;

      case "CHAT_SELECTED":
        if (action.profile.conversationId !== action.fromConversationId) {
          draft.inbox.preselectedMessage.contextMessages = contextMessagesInit;
        }
        break;
    }
  }
);

const scrollReducer = createMessagesContextScrollReducer(
  (s) => s.inbox.preselectedMessage.contextMessages,
  {
    click: "INBOX.MESSAGE.PRESELECTED_MESSAGE_CLICK",
    load: "INBOX.MESSAGE.PRESELECTED_CONTEXT_LOAD",
    loaded: "INBOX.MESSAGE.PRESELECTED_CONTEXT_LOADED",
    error: "INBOX.MESSAGE.PRESELECTED_CONTEXT_LOAD_ERROR",
  }
);

export const preselectedMessagesReducer = reduceReducersWithDefaults(
  preselectReducer,
  scrollReducer
);
