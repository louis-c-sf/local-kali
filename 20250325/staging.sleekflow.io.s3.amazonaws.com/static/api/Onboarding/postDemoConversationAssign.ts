import { post } from "../apiRequest";
import { POST_INBOX_DEMO_ASSIGN } from "../apiPath";

export default async function postDemoConversationAssign(
  demoConversationId: string,
  assignee: string
) {
  return await post(
    POST_INBOX_DEMO_ASSIGN.replace("{demoConversationId}", demoConversationId),
    {
      param: { assignee },
    }
  );
}
