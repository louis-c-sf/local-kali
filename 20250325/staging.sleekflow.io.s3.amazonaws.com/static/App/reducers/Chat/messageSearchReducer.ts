import produce from "immer";
import { LoginType, Action } from "../../../types/LoginType";
import { initialUser } from "../../../context/LoginContext";
import { uniqBy, prop } from "ramda";
import {
  messageSearchInit,
  contextMessagesInit,
} from "../../../types/state/inbox/MessageSearchType";
import { createMessagesContextScrollReducer } from "./createMessagesContextScrollReducer";
import { reduceReducersWithDefaults } from "../../../utility/reduce-reducers";
import { mergeMessages } from "../../../component/Chat/mutators/mergeMessages";

const searchReducer = produce(
  (draft: LoginType = initialUser, action: Action) => {
    const messageSearch = draft.inbox.messageSearch;
    switch (action.type) {
      case "INBOX.MESSAGE.SEARCH_OPEN":
        messageSearch.active = true;
        messageSearch.loading = false;
        messageSearch.contextMessages = contextMessagesInit;
        break;

      case "INBOX.MESSAGE.SEARCH_CLOSE":
        draft.inbox.messageSearch = messageSearchInit;
        break;

      case "INBOX.MESSAGE.SEARCH_RESET":
        messageSearch.query = "";
        messageSearch.queryLatest = undefined;
        messageSearch.results = [];
        messageSearch.loading = false;
        messageSearch.contextMessages = contextMessagesInit;
        messageSearch.highlightMessage = undefined;
        messageSearch.clickedMessage = undefined;
        break;

      case "INBOX.MESSAGE.SEARCH_TYPE":
        messageSearch.query = action.query;
        messageSearch.loading = true;
        break;

      case "INBOX.MESSAGE.SEARCH_LOADED":
        messageSearch.results = action.results;
        messageSearch.queryLatest = action.query;
        messageSearch.loading = false;
        messageSearch.highlightMessage = undefined;
        messageSearch.clickedMessage = undefined;
        break;

      case "INBOX.MESSAGE.SEARCH_RESULT_CLICK":
        messageSearch.highlightMessage = undefined;
        messageSearch.clickedMessage = action.message;
        break;

      case "INBOX.MESSAGE.SEARCH_CONTEXT_LOADED":
        messageSearch.highlightMessage = action.highlight;
        break;

      case "CHATS_RESET":
      case "CHAT_SELECTED":
        draft.inbox.messageSearch = messageSearchInit;
        break;
      case "INBOX.API.ERROR":
        draft.inbox.messageSearch.loading = false;
        break;
    }
  }
);

const scrollReducer = createMessagesContextScrollReducer(
  (s) => s.inbox.messageSearch.contextMessages,
  {
    click: "INBOX.MESSAGE.SEARCH_RESULT_CLICK",
    load: "INBOX.MESSAGE.SEARCH_CONTEXT_LOAD",
    loaded: "INBOX.MESSAGE.SEARCH_CONTEXT_LOADED",
    error: "INBOX.MESSAGE.SEARCH_CONTEXT_LOAD_ERROR",
  }
);

export const messageSearchReducer = reduceReducersWithDefaults(
  searchReducer,
  scrollReducer
);
