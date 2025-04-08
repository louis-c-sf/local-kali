import { Epic } from "redux-observable";
import { LoginType, Action } from "../../../../types/LoginType";
import { subscribeOnScroller } from "../helpers/subscribeOnScroller";

export const scrollContextEpic: Epic<
  Action,
  Action,
  LoginType
> = subscribeOnScroller(
  "INBOX.MESSAGE.SEARCH_CONTEXT_SCROLL",
  (conversationId, timestamp, timestampPosition) => {
    if (timestampPosition === "before") {
      return {
        type: "INBOX.MESSAGE.SEARCH_CONTEXT_LOAD",
        beforeTimestamp: timestamp,
        conversationId,
      };
    }
    return {
      type: "INBOX.MESSAGE.SEARCH_CONTEXT_LOAD",
      afterTimestamp: timestamp,
      conversationId,
    };
  },
  (s) => s.inbox.messageSearch.contextMessages
);
