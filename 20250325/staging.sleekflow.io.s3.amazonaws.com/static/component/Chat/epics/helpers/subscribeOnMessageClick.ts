import { ofType } from "redux-observable";
import { catchError, debounceTime, map, switchMap } from "rxjs/operators";
import { forkJoin, Observable } from "rxjs";
import { Action, LoginType, ProfileType } from "../../../../types/LoginType";
import { Epic } from "redux-observable/src/epic";
import { getWithExceptions$ } from "../../../../api/apiRequest";
import { GET_CONVERSATIONS_MESSAGES } from "../../../../api/apiPath";
import { normalizeAPIMessagesPage } from "../../mutators/messageMutators";
import MessageType from "../../../../types/MessageType";

type ClickActionType = { type: Action["type"]; message: MessageType };

type ActionCreator = (
  messagesBefore: MessageType[],
  messagesAfter: MessageType[],
  highlight: MessageType
) => Action;

export function subscribeOnMessageClick(
  type: Action["type"],
  pageSize: number,
  createResultAction: ActionCreator
): Epic<Action, Action, LoginType> {
  function checkAction(action: any): action is ClickActionType {
    return action.type === type;
  }

  return (action$, state$) => {
    return action$.pipe(
      ofType(type),
      debounceTime(300),
      switchMap((action) => {
        if (!checkAction(action)) {
          throw `Wrong type ${action.type}`;
        }
        const conversationId = action.message.conversationId;
        const messageTime = action.message.timestamp;
        return forkJoin([
          loadMessage$(
            conversationId,
            messageTime,
            "before",
            state$.value.profile,
            pageSize
          ),
          loadMessage$(
            conversationId,
            messageTime,
            "after",
            state$.value.profile,
            pageSize
          ),
        ]).pipe(
          map(([resultsBefore, resultsAfter]) =>
            createResultAction(resultsBefore, resultsAfter, action.message)
          ),
          catchError((err, retry): Observable<Action> => {
            console.error(err);
            return retry;
          })
        );
      })
    );
  };
}

function loadMessage$(
  conversationId: string,
  timestamp: number,
  direction: "before" | "after",
  profile: ProfileType,
  pageSize: number
) {
  return getWithExceptions$(
    GET_CONVERSATIONS_MESSAGES.replace("{id}", conversationId),
    {
      param: {
        limit: pageSize,
        ...(direction === "before" && { beforeTimestamp: timestamp }),
        ...(direction === "after" && { afterTimestamp: timestamp }),
      },
    }
  ).pipe(
    map((data) => normalizeAPIMessagesPage(data.data as MessageType[], profile))
  );
}
