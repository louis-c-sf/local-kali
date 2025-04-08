import { LoginType, Action } from "../../types/LoginType";
import { initialUser } from "../../context/LoginContext";
import produce from "immer";

export function updateTypingReducer(
  state: LoginType = initialUser,
  action: Action
): LoginType {
  switch (action.type) {
    case "TYPING_CONVERSATION":
      return produce(state, (draft) => {
        if (
          draft.user.id === action.conversationTypingResponse.staffId ||
          draft.profile.conversationId !==
            action.conversationTypingResponse.conversationId
        ) {
          return;
        }
        draft.inbox.conversationTypingSignalrResponse =
          action.conversationTypingResponse;
      });

    case "TYPING_CONVERSATION_HIDE":
      return produce(state, (draft) => {
        draft.inbox.conversationTypingSignalrResponse = null;
      });
  }
  return state;
}
