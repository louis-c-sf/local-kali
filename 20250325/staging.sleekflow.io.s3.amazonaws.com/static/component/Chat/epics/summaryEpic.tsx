import { ofType } from "redux-observable";
import { LoginType, Action } from "../../../types/LoginType";
import { Epic } from "redux-observable/src/epic";
import { switchMap, catchError, map, debounceTime } from "rxjs/operators";
import {
  fetchAllSummaries$,
  InboxFilterParamsType,
} from "../../../api/Chat/fetchAllSummaries";
import { buildFilterFromState } from "../../../api/Chat/useChatsFilterBuilder";
import { TeamType, matchesStaffId } from "../../../types/TeamType";
import { of, Observable, throwError } from "rxjs";
import { DefaultOrderBy } from "types/state/InboxStateType";

function fetchSummariesUpdate$(
  state: LoginType,
  filter?: InboxFilterParamsType
) {
  const tags =
    state.company?.companyHashtags.filter(
      (tag) => Boolean(tag.id) && state.inbox.filter.tagIds.includes(tag.id)
    ) ?? [];
  const userId = state.user.id;
  const teams = state.settings.teamsSettings.teams.filter((t: TeamType) =>
    t.members.some(matchesStaffId(userId))
  );
  const filterParam =
    filter ??
    buildFilterFromState(
      state.selectedStatus,
      teams,
      state.selectedAssigneeId,
      state.selectedChannel,
      state.selectedInstanceId,
      tags,
      state.inbox.filter,
      state.inbox.filter.orderBy ?? DefaultOrderBy
    );

  return fetchAllSummaries$(
    userId,
    state.selectedAssigneeId ?? "all",
    filterParam
  );
}

export const summaryEpic: Epic<Action, Action, LoginType> = (action$, state$) =>
  action$.pipe(
    ofType("INBOX.API.LOAD_SUMMARY"),
    debounceTime(1500),
    switchMap((action) => {
      if (action.type !== "INBOX.API.LOAD_SUMMARY") {
        return throwError("bad type");
      }
      return fetchSummariesUpdate$(state$.value, action.filter).pipe(
        map((result) => {
          const { assignees, summary } = result;
          return {
            type: "INBOX.FILTER.UPDATE_SUMMARY",
            assigneeSummary: assignees,
            assigneeAssignedNumber: summary,
          } as Action;
        }),
        catchError(
          (err): Observable<Action> =>
            of({
              type: "INBOX.API.ERROR",
              error: String(err),
            })
        )
      );
    })
  );
