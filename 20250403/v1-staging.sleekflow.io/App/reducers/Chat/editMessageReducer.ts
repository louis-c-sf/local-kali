import produce from "immer";
import { LoginType, Action } from "../../../types/LoginType";
import { initialUser } from "../../../context/LoginContext";
import {
  NormalizedWhatsAppTemplateType,
  OptInType,
} from "../../../features/Whatsapp360/models/OptInType";

export type WhatsappTemplatesStateType = {
  templates: {
    booted: boolean;
    data: NormalizedWhatsAppTemplateType;
  };
  optIn: {
    booted: boolean;
    data: OptInType;
  };
};

export type EditMessageActionType =
  | {
      type: "INBOX.EDIT_MESSAGE.PICKED";
      id: number;
    }
  | {
      type: "INBOX.EDIT_MESSAGE.CANCEL";
    };

export type EditMessageState = {
  id: number | null;
  // content: string
};

export function defaultEditMessageState(): EditMessageState {
  return {
    id: null,
    // content: "",
  };
}

export const editMessageReducer = produce(
  (draft: LoginType = initialUser, action: Action) => {
    const editDraft = draft.inbox.messenger.editMessage;
    switch (action.type) {
      case "INBOX.EDIT_MESSAGE.PICKED":
        editDraft.id = action.id;
        //todo
        break;
    }
  }
);
