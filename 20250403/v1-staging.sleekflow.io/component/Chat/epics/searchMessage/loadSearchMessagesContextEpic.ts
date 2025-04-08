import { Epic } from "redux-observable/src/epic";
import { Action, LoginType } from "../../../../types/LoginType";
import { normalizeAPIMessagesPage } from "../../mutators/messageMutators";
import { subscribeOnMessageLoad } from "../helpers/subscribeOnMessageLoad";

export const loadSearchMessagesContextEpic: Epic<
  Action,
  Action,
  LoginType
> = subscribeOnMessageLoad(
  "INBOX.MESSAGE.SEARCH_CONTEXT_LOAD",
  (messages, profile, direction) => ({
    type: "INBOX.MESSAGE.SEARCH_CONTEXT_LOADED",
    messages: normalizeAPIMessagesPage(messages, profile),
    direction: direction,
  })
);
