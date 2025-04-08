import { get } from "../apiRequest";
import { GET_INBOX_DEMO_CONVERSATION } from "../apiPath";

export default async function fetchInboxDemoConversation(
  conversationId: number
) {
  return await get(
    GET_INBOX_DEMO_CONVERSATION.replace(
      "{demoConversationId}",
      String(conversationId)
    ),
    {
      param: {},
    }
  );
}
