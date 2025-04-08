import { getWithExceptions, getWithExceptions$ } from "../apiRequest";
import { GET_CONVERSATIONS_SUMMARY } from "../apiPath";
import ChatsSummaryResponseType from "../../types/ChatsSummaryResponseType";
import { InboxFilterParamsType } from "./fetchAllSummaries";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

export async function fetchChatsSummary(
  filters: InboxFilterParamsType
): Promise<ChatsSummaryResponseType[]> {
  return await getWithExceptions(GET_CONVERSATIONS_SUMMARY, { param: filters });
}

export function fetchChatsSummary$(
  filters: InboxFilterParamsType
): Observable<ChatsSummaryResponseType[]> {
  return getWithExceptions$(GET_CONVERSATIONS_SUMMARY, { param: filters }).pipe(
    map((response) => response.data as ChatsSummaryResponseType[])
  );
}
