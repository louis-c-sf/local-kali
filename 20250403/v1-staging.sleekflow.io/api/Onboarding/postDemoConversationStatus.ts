import { post } from "../apiRequest";
import { POST_INBOX_DEMO_STATUS } from "../apiPath";

export default async function postDemoConversationStatus(
  demoConversationId: string,
  status: string
) {
  return await post(
    POST_INBOX_DEMO_STATUS.replace("{demoConversationId}", demoConversationId),
    {
      param: { status },
    }
  );
}
