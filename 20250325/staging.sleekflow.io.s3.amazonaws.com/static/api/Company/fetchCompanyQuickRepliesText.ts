import {
  denormalizeQuickReplyResponse,
  QuickReplyNormalizedType,
} from "../../types/QuickReplies/QuickReplyType";
import { get } from "../apiRequest";
import { GET_QUICK_REPLY_TEXT } from "../apiPath";
import { QUICK_REPLY_LIMIT } from "./fetchCompanyQuickReplies";

export async function fetchCompanyQuickRepliesText(
  language: string,
  conversationId: string
) {
  const results: { list: QuickReplyNormalizedType[] } = await get(
    GET_QUICK_REPLY_TEXT,
    {
      param: {
        offset: 0,
        limit: QUICK_REPLY_LIMIT,
        conversationId,
      },
    }
  );
  return results.list.map((r) => {
    return denormalizeQuickReplyResponse(r, language);
  });
}
