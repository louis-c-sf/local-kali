import { postWithExceptions } from "../apiRequest";
import { POST_TWILIO_TEMPLATE_BOOKMARK } from "../apiPath";

export async function postAddTemplateBookmark(accountSId: string, sid: string) {
  return postWithExceptions(
    POST_TWILIO_TEMPLATE_BOOKMARK.replace("{id}", accountSId),
    {
      param: {
        templateId: sid,
        isBookmark: true,
      },
    }
  );
}
