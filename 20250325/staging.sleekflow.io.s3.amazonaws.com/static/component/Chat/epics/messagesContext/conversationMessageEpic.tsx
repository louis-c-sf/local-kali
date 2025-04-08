import { ofType } from "redux-observable";
import { Epic } from "redux-observable/src/epic";
import { Action, LoginType, ProfileType } from "types/LoginType";
import { switchMap, catchError, map } from "rxjs/operators";
import { of, Observable, throwError } from "rxjs";
import { fetchConversationDetail$ } from "api/Chat/fetchConversationDetail";
import {
  isUserInvolvedInChat,
  matchesConversationId,
} from "component/Chat/mutators/chatSelectors";
import { denormalizeConversationCollaborators } from "types/Chat/denormalizeConversationCollaborators";

export const conversationMessageEpic: Epic<Action, Action, LoginType> = (
  action$,
  state$
) =>
  action$.pipe(
    ofType("INBOX.API.LOAD_CONVERSATION"),
    switchMap((action) => {
      if (action.type !== "INBOX.API.LOAD_CONVERSATION") {
        return throwError("bad type");
      }

      if (
        state$.value.chats?.some(
          matchesConversationId(action.message.conversationId)
        )
      ) {
        return new Observable<Action>((subscribe) =>
          subscribe.next({
            type: "MESSAGE_UPDATED",
            conversationId: action.message.conversationId,
            message: action.message,
          } as Action)
        );
      }
      return fetchConversationDetail$(action.message.conversationId).pipe(
        map((result) => {
          const { selectedAssigneeId, selectedStatus } = state$.value;
          const { updatedAt, createdAt } = action.message;
          const profile: ProfileType = {
            ...result.userProfile,
            updatedTime: updatedAt ?? createdAt,
            unReadMsg: result.unreadMessageCount > 0,
            isBookmarked: result.isBookmarked,
            conversationHashtags: result.conversationHashtags,
            lastChannel: action.message.channel,
            assignee: result.assignee ? result.assignee.userInfo : undefined,
            collaboratorIds: denormalizeConversationCollaborators(result),
          };
          if (
            selectedStatus === result.status &&
            selectedAssigneeId &&
            (isUserInvolvedInChat(selectedAssigneeId, profile) ||
              selectedAssigneeId === "all")
          ) {
            return {
              type: "MESSAGE_UPDATED",
              conversationId: action.message.conversationId,
              message: action.message,
              conversation: profile,
            } as Action;
          } else {
            return {
              type: "MESSAGE_UPDATED",
              conversationId: action.message.conversationId,
              message: action.message,
              conversation: undefined,
            } as Action;
          }
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
