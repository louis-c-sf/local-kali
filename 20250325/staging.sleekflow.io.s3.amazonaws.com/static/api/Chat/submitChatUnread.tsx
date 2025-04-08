import { post } from "../apiRequest";
import { POST_CONVERSATION_MARK_UNREAD } from "../apiPath";

export async function submitChatUnread(conversationId: string) {
  return await post(
    POST_CONVERSATION_MARK_UNREAD.replace("{id}", conversationId),
    { param: {} }
  );
}
