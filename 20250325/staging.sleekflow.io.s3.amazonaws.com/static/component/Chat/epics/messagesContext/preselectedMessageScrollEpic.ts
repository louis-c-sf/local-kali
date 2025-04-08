import { Epic } from "redux-observable";
import { LoginType, Action } from "../../../../types/LoginType";
import { subscribeOnScroller } from "../helpers/subscribeOnScroller";

export const preselectedMessageScrollEpic: Epic<
  Action,
  Action,
  LoginType
> = subscribeOnScroller(
  "INBOX.MESSAGE.PRESELECTED_CONTEXT_SCROLL",
  (conversationId, timestamp, timestampPosition) => {
    if (timestampPosition === "before") {
      return {
        type: "INBOX.MESSAGE.PRESELECTED_CONTEXT_LOAD",
        beforeTimestamp: timestamp,
        conversationId,
      };
    }
    return {
      type: "INBOX.MESSAGE.PRESELECTED_CONTEXT_LOAD",
      afterTimestamp: timestamp,
      conversationId,
    };
  },
  (s) => s.inbox.preselectedMessage.contextMessages
);
