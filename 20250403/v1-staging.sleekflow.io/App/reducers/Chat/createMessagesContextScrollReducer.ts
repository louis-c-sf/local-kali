import produce from "immer";
import { LoginType, Action } from "../../../types/LoginType";
import { initialUser } from "../../../context/LoginContext";
import { ContextMessagesStateType } from "../../../types/state/inbox/MessageSearchType";
import { uniqBy, prop } from "ramda";
import MessageType from "../../../types/MessageType";
import {
  ContextMessagesErrorAction,
  ContextMessagesLoadAction,
  ContextMessagesLoadedAction,
  ContextMessagesClickAction,
} from "../../../types/Action/ContextMessagesAction";
import { mergeMessages } from "../../../component/Chat/mutators/mergeMessages";

export function createMessagesContextScrollReducer(
  selectSlice: (state: LoginType) => ContextMessagesStateType,
  actionTypes: {
    click: ContextMessagesClickAction["type"];
    load: ContextMessagesLoadAction["type"];
    loaded: ContextMessagesLoadedAction["type"];
    error: ContextMessagesErrorAction["type"];
  }
) {
  return produce((draft: LoginType = initialUser, action: Action) => {
    const slice = selectSlice(draft);
    switch (action.type) {
      case actionTypes.click:
        slice.active = true;
        slice.loading = true;
        slice.hasMoreAfter = true;
        slice.hasMoreBefore = true;
        slice.initialized = false;
        break;

      case actionTypes.load:
        slice.loading = true;
        break;

      case actionTypes.loaded:
        slice.loading = false;
        slice.initialized = true;
        const newMessages = uniqBy((m: MessageType) => m.id, action.messages);
        if (
          action.highlight &&
          !newMessages.some(
            (m) =>
              m.id === action.highlight!.id &&
              m.conversationId === action.highlight!.conversationId
          )
        ) {
          newMessages.push(action.highlight);
        }
        const previousStamp = slice.list
          .map(prop("id"))
          .sort()
          .join();
        slice.list = mergeMessages(slice.list, newMessages);
        const newDataStamp = slice.list
          .map(prop("id"))
          .sort()
          .join();
        if (previousStamp === newDataStamp) {
          // no new messages but duplicates
          if (action.direction === "before") {
            slice.hasMoreBefore = false;
          }
          if (action.direction === "after") {
            slice.hasMoreAfter = false;
          }
        } else {
          draft.messagesMemoized = mergeMessages(
            draft.messagesMemoized,
            action.messages
          );
        }
        break;

      case actionTypes.error:
        slice.loading = false;
        break;
    }
  });
}
