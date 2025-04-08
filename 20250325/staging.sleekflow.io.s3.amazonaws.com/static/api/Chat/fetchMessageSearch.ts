import { getWithExceptions$ } from "../apiRequest";
import { GET_SEARCH_MESSAGE_BY_CONVERSATION } from "../apiPath";
import MessageType from "../../types/MessageType";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

export function fetchMessageSearch$(
  conversationId: string,
  query: string
): Observable<MessageType[]> {
  return getWithExceptions$(
    GET_SEARCH_MESSAGE_BY_CONVERSATION.replace(
      "{conversationId}",
      conversationId
    ),
    { param: { keywords: query.trim(), limit: 100, offset: 0 } }
  ).pipe(map((response) => response.data));
}
