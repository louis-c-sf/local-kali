import { post } from "../apiRequest";
import { POST_INBOX_DEMO_NOTE } from "../apiPath";

export default async function postDemoNote(
  channel: string,
  demoConversationId: number,
  messageContent: string,
  isFromUser: boolean
) {
  return await post(POST_INBOX_DEMO_NOTE, {
    param: { channel, demoConversationId, messageContent, isFromUser },
  });
}
