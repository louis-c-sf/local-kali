import { InteractiveMessageValues } from "component/Chat/InteractiveMessage/InteractiveMessageSchema";
import produce from "immer";
import { initialUser } from "../../../context/LoginContext";
import { LoginType, Action } from "../../../types/LoginType";
import { defaultSendTemplateState } from "./whatsappTemplatesReducer";

export type InteractiveMessageStateType = InteractiveMessageValues;

export type InteractiveMessageActionType =
  | {
      type: "INBOX.INTERACTIVE_MESSAGE.RESET";
    }
  | {
      type: "INBOX.INTERACTIVE_MESSAGE.SET";
      values: InteractiveMessageValues;
    };

export const interactiveMessageReducer = produce(
  (draft: LoginType = initialUser, action: Action) => {
    const draftMessenger = draft.inbox.messenger;

    switch (action.type) {
      case "INBOX.INTERACTIVE_MESSAGE.SET":
        draftMessenger.interactiveMessage = action.values;
        draftMessenger.attachedFiles = [];
        draftMessenger.quickReplyFiles = [];
        draftMessenger.sendWhatsappTemplate = defaultSendTemplateState("type");
        break;
      case "INBOX.INTERACTIVE_MESSAGE.RESET":
        draftMessenger.interactiveMessage = undefined;
        break;
    }
  }
);
