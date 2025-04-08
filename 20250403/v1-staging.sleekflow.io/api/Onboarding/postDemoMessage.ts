import { post } from "../apiRequest";
import { POST_INBOX_DEMO_MESSAGE } from "../apiPath";

export default async function postDemoMessage(
  channel: string,
  demoConversationId: number,
  messageContent: string,
  isFromUser: boolean
) {
  return await post(POST_INBOX_DEMO_MESSAGE, {
    param: { channel, demoConversationId, messageContent, isFromUser },
  });
}
