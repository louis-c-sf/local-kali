import { getWithExceptions$ } from "../apiRequest";
import {
  GET_FILTERS_SUMMARY_ALL,
  GET_FILTERS_SUMMARY_MENTIONS,
  GET_FILTERS_SUMMARY_TEAM_UNASSIGNED,
  GET_FILTERS_SUMMARY_UNASSIGNED,
  GET_FILTERS_SUMMARY_USER,
} from "../apiPath";
import { AssigneeSummaryResponseType } from "../../types/ChatsSummaryResponseType";
import { AssigneeModeType, InboxFilterParamsType } from "./fetchAllSummaries";
import { map } from "rxjs/operators";
import { Observable } from "rxjs";

const routeMap: Record<AssigneeModeType, string> = {
  all: GET_FILTERS_SUMMARY_ALL,
  unassigned: GET_FILTERS_SUMMARY_UNASSIGNED,
  teamunassigned: GET_FILTERS_SUMMARY_TEAM_UNASSIGNED,
  mentioned: GET_FILTERS_SUMMARY_MENTIONS,
  mentions: GET_FILTERS_SUMMARY_MENTIONS,
  you: GET_FILTERS_SUMMARY_USER,
  user: GET_FILTERS_SUMMARY_USER,
};

export function fetchChatsAssigneeSummary$(
  userId: string,
  mode: AssigneeModeType,
  filters: InboxFilterParamsType
): Observable<AssigneeSummaryResponseType> {
  const route = routeMap[mode] ?? GET_FILTERS_SUMMARY_USER;
  return getWithExceptions$(route.replace("{userId}", userId), {
    param: filters,
  }).pipe(map((response) => response.data as AssigneeSummaryResponseType));
}
