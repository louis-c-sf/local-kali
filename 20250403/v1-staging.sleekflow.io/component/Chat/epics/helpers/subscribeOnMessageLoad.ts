import { Action, LoginType, ProfileType } from "../../../../types/LoginType";
import { Observable, of, throwError } from "rxjs";
import { ofType, StateObservable } from "redux-observable";
import {
  catchError,
  distinctUntilChanged,
  filter,
  map,
  mergeMap,
} from "rxjs/operators";
import { equals } from "ramda";
import { getWithExceptions$ } from "../../../../api/apiRequest";
import { GET_CONVERSATIONS_MESSAGES } from "../../../../api/apiPath";
import MessageType from "../../../../types/MessageType";

interface LoadActionType<T> {
  type: T;
  conversationId: string;
  beforeTimestamp?: number;
  afterTimestamp?: number;
}

type CreateActionType = (
  messages: MessageType[],
  profile: ProfileType,
  direction?: "before" | "after"
) => Action;

export function subscribeOnMessageLoad<T extends Action["type"]>(
  type: T,
  createFinishAction: CreateActionType
) {
  function checkInput(action: unknown): action is LoadActionType<T> {
    return (action as Action).type === type;
  }

  return (action$: Observable<Action>, state$: any) =>
    action$.pipe(
      ofType(type),
      distinctUntilChanged<Action>(equals),
      filter((action) => {
        if (!checkInput(action)) {
          return false;
        }
        const messageSearchState = (state$ as StateObservable<LoginType>).value
          .inbox.messageSearch;
        if (
          action.beforeTimestamp &&
          !messageSearchState.contextMessages.hasMoreBefore
        ) {
          return false;
        }
        if (
          action.afterTimestamp &&
          !messageSearchState.contextMessages.hasMoreAfter
        ) {
          return false;
        }
        return true;
      }),
      mergeMap((action) => {
        if (!checkInput(action)) {
          return throwError("Wrong action");
        }
        let param = {};
        let direction: "before" | "after" | undefined;
        if (action.beforeTimestamp) {
          direction = "before";
          param = {
            beforeTimestamp: action.beforeTimestamp,
            limit: 30,
          };
        } else if (action.afterTimestamp) {
          direction = "after";
          param = {
            afterTimestamp: action.afterTimestamp,
            limit: 30,
          };
        } else {
          return throwError("Invalid action");
        }

        return getWithExceptions$(
          GET_CONVERSATIONS_MESSAGES.replace("{id}", action.conversationId),
          { param }
        ).pipe(
          map((data) =>
            createFinishAction(data.data, state$.value.profile, direction)
          ),
          catchError(
            (err): Observable<Action> =>
              of({
                type: "INBOX.API.ERROR",
                error: String(err),
              } as Action)
          )
        );
      })
    );
}
