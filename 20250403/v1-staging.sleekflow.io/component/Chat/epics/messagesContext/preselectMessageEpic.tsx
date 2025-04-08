import { subscribeOnMessageClick } from "../helpers/subscribeOnMessageClick";

const PAGE_SIZE = 10;

export const preselectMessageEpic = subscribeOnMessageClick(
  "INBOX.MESSAGE.PRESELECTED_MESSAGE_CLICK",
  PAGE_SIZE,
  (resultsBefore, resultsAfter, highlight) => ({
    type: "INBOX.MESSAGE.PRESELECTED_CONTEXT_LOADED",
    messages: [...resultsBefore, ...resultsAfter],
    highlight,
  })
);
