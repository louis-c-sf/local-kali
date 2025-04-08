import { LoginType, Action } from "../../types/LoginType";
import { initialUser } from "../../context/LoginContext";
import produce from "immer";

export function sendAsMessageReducer(
  state: LoginType = initialUser,
  action: Action
): LoginType {
  switch (action.type) {
    case "INBOX.MESSAGE.SEND_AS_MESSAGE":
      return produce(state, (draft) => {
        draft.inbox.sendAsMessage = action.message;
      });
    case "INBOX.MESSAGE.CLEAR_SEND_AS_MESSAGE":
      return produce(state, (draft) => {
        draft.inbox.sendAsMessage = null;
      });
  }
  return state;
}
