import { Epic, ofType, StateObservable, combineEpics } from "redux-observable";
import { Action, LoginType } from "types/LoginType";
import { LoginContextType } from "context/LoginContext";
import { Observable, EMPTY, of } from "rxjs";
import {
  concatMap,
  mergeMap,
  switchMap,
  delay,
  take,
  retryWhen,
  filter,
} from "rxjs/operators";
import { Union } from "ts-toolbelt";
import { postWithExceptions$ } from "api/apiRequest";

export const typeStartEpic: Epic<Action, Action, LoginContextType> = (
  action$: Observable<Action>,
  state$: StateObservable<LoginType>
) => {
  return action$.pipe(
    ofType("INBOX.MESSENGER.TYPE_START"),
    mergeMap(() => {
      return postWithExceptions$("/conversation/typing", {
        param: { conversationId: state$.value.profile.conversationId },
      }).pipe(
        concatMap(() => EMPTY),
        retryWhen((e) => e.pipe(delay(300), take(3)))
      );
    })
  );
};

type TypingActionType = Union.Select<Action, { type: "TYPING_CONVERSATION" }>;

const showIndicatorEpic: Epic<Action, Action, LoginContextType> = (
  action$: Observable<Action>,
  state$: StateObservable<LoginType>
) => {
  return action$.pipe(
    ofType("TYPING_CONVERSATION"),
    filter((_) => {
      const action = _ as TypingActionType;
      const isMyMessage =
        action.conversationTypingResponse.staffId === state$.value.user.id;
      const isChatVisible =
        action.conversationTypingResponse.conversationId ===
        state$.value.profile.conversationId;
      return !isMyMessage && isChatVisible;
    }),
    switchMap(() =>
      of({ type: "TYPING_CONVERSATION_HIDE" } as Action).pipe(delay(5000))
    )
  );
};

export const typeIndicatorEpic = combineEpics(typeStartEpic, showIndicatorEpic);
