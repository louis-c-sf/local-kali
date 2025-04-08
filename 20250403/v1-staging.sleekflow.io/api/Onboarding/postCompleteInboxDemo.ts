import { post } from "../apiRequest";
import { POST_INBOX_DEMO_COMPLETE } from "../apiPath";

export default async function postCompleteInboxDemo(userId: string) {
  return await post(POST_INBOX_DEMO_COMPLETE.replace("{staffId}", userId), {
    param: {},
  });
}
