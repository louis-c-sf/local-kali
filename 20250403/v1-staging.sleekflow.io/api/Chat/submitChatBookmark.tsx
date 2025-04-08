import { POST_CONVERSATION_BOOKMARK } from "../apiPath";
import { post } from "../apiRequest";

export async function submitChatBookmark(
  conversationId: string,
  bookmark: boolean
) {
  const url = POST_CONVERSATION_BOOKMARK.replace("{id}", conversationId);
  const query = new URLSearchParams({ bookmark: bookmark ? "true" : "false" });
  return await post(`${url}?${query}`, { param: {} });
}
