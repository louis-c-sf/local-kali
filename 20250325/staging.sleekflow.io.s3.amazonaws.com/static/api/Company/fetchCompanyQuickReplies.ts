import {
  denormalizeQuickReplyResponse,
  QuickReplyNormalizedType,
} from "../../types/QuickReplies/QuickReplyType";
import { get } from "../apiRequest";
import { GET_QUICK_REPLIES } from "../apiPath";

export const QUICK_REPLY_LIMIT = 600;
export async function fetchCompanyQuickReplies(language: string) {
  const results: { list: QuickReplyNormalizedType[] } = await get(
    GET_QUICK_REPLIES,
    {
      param: {
        offset: 0,
        limit: QUICK_REPLY_LIMIT,
      },
    }
  );
  return results.list.map((r) => {
    return denormalizeQuickReplyResponse(r, language);
  });
}
