import { ofType } from "redux-observable";
import { LoginType, Action } from "../../../../types/LoginType";
import { Epic } from "redux-observable/src/epic";
import { switchMap, catchError, debounceTime, map } from "rxjs/operators";
import { of, Observable, throwError } from "rxjs";
import { fetchMessageSearch$ } from "../../../../api/Chat/fetchMessageSearch";
import { normalizeAPIMessagesPage } from "../../mutators/messageMutators";

export const searchMessagesEpic: Epic<Action, Action, LoginType> = (
  action$,
  state$
) => {
  return action$.pipe(
    ofType("INBOX.MESSAGE.SEARCH_TYPE"),
    debounceTime(500),
    switchMap((action) => {
      if (action.type !== "INBOX.MESSAGE.SEARCH_TYPE") {
        return throwError(`Wrong type ${action.type}`);
      }
      if (action.query.trim() === "") {
        return of({ type: "INBOX.MESSAGE.SEARCH_RESET" } as Action);
      }
      const profile = { ...state$.value.profile };
      return fetchMessageSearch$(action.conversationId, action.query).pipe(
        map(
          (data) =>
            ({
              type: "INBOX.MESSAGE.SEARCH_LOADED",
              results: normalizeAPIMessagesPage(data, profile),
            } as Action)
        ),
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
};
