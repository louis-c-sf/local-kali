import { GET_CONVERSATIONS_DETAIL } from "api/apiPath";
import { getWithExceptions$ } from "api/apiRequest";
import { map } from "rxjs/operators";
import ConversationType from "types/ConversationType";

export function fetchConversationDetail$(conversationId: string) {
  return getWithExceptions$(
    GET_CONVERSATIONS_DETAIL.replace("{id}", conversationId),
    {
      param: {},
    }
  ).pipe(map((response) => response.data as ConversationType));
}
