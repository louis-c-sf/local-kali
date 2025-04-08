import { subscribeOnMessageClick } from "../helpers/subscribeOnMessageClick";

const PAGE_SIZE = 10;

export const foundMessageClickEpic = subscribeOnMessageClick(
  "INBOX.MESSAGE.SEARCH_RESULT_CLICK",
  PAGE_SIZE,
  (resultsBefore, resultsAfter, highlight) => ({
    type: "INBOX.MESSAGE.SEARCH_CONTEXT_LOADED",
    messages: [...resultsBefore, ...resultsAfter],
    highlight,
  })
);
