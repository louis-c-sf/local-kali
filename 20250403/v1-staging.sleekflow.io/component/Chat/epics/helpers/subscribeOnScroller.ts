import { Action, LoginType } from "../../../../types/LoginType";
import { Observable, of, EMPTY } from "rxjs";
import { StateObservable, ofType } from "redux-observable";
import { debounceTime, filter, switchMap, catchError } from "rxjs/operators";
import { ContextMessagesStateType } from "../../../../types/state/inbox/MessageSearchType";
import { sortedFromOldest } from "../../mutators/sortedFromOldest";

type CreateLoadActionType = (
  conversationId: string,
  timestamp: number,
  timestampPosition: "before" | "after"
) => Action;
type ScrollBoundActionType<T extends Action["type"]> = {
  type: T;
  bound: "upper" | "lower";
};

export function subscribeOnScroller<T extends Action["type"]>(
  scrollActionType: T,
  createLoadAction: CreateLoadActionType,
  selectSlice: (s: LoginType) => ContextMessagesStateType
) {
  function checkInput(action: unknown): action is ScrollBoundActionType<T> {
    return (action as Action).type === scrollActionType;
  }

  return ($action: Observable<Action>, $state: StateObservable<LoginType>) =>
    $action.pipe(
      ofType(scrollActionType),
      debounceTime(100),
      filter((action) => {
        if (!checkInput(action)) {
          throw "Wrong type";
        }
        const contextMessagesState = selectSlice($state.value);
        return (
          // skip the direction that does not have any data anymore
          (action.bound === "upper" && contextMessagesState.hasMoreBefore) ||
          (action.bound === "lower" && contextMessagesState.hasMoreAfter)
        );
      }),
      switchMap((action) => {
        if (!checkInput(action)) {
          throw "Wrong type";
        }
        const state = $state.value;
        const contextMessagesState = selectSlice(state);
        const contextMessages = sortedFromOldest(contextMessagesState.list);
        const [oldestMessage] = contextMessages;
        const [latestMessage] = contextMessages.reverse();
        const conversationId = state.profile.conversationId;
        if (action.bound === "upper" && oldestMessage) {
          return of(
            createLoadAction(conversationId, oldestMessage.timestamp, "before")
          );
        }
        if (latestMessage) {
          return of(
            createLoadAction(conversationId, latestMessage.timestamp, "after")
          );
        }
        return EMPTY;
      }),
      catchError((err, observable) => {
        console.error(err);
        return observable;
      })
    );
}
