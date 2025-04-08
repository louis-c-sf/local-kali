import { post } from "../apiRequest";
import {
  POST_CONVERSATION_MARK_UNREAD,
  POST_CONVERSATION_MARK_READ,
} from "../apiPath";

export function submitChatRead(conversationId: string) {
  return post(POST_CONVERSATION_MARK_READ.replace("{id}", conversationId), {
    param: {},
  });
}
