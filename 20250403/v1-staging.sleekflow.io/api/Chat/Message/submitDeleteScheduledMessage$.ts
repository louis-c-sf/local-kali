import { postWithExceptions$ } from "../../apiRequest";
import { DELETE_MESSAGE_SCHEDULED } from "../../apiPath";
import { map } from "rxjs/operators";

export function submitDeleteScheduledMessage$(messageId: number) {
  return postWithExceptions$(DELETE_MESSAGE_SCHEDULED, {
    param: {
      messageIds: [messageId],
    },
  }).pipe(map((r$) => r$.data));
}
