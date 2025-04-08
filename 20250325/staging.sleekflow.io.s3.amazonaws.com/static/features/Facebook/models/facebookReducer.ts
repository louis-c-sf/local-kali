import {
  FacebookMessageType,
  OptionType,
  FacebookOTNStateDictEnum,
} from "./FacebookOTNTypes";
import produce from "immer";
import { initialUser } from "../../../context/LoginContext";
import { LoginType, Action } from "../../../types/LoginType";

export const defaultMessageTypeState = (): FacebookMessageType => ({
  showBanner: false,
  loading: false,
  refreshFacebookOTNState: () => {},
  showModal: false,
  showOverlay: false,
  showMessageTag: false,
});

export type FacebookActionType =
  | {
      type: "INBOX.FACEBOOK.MESSAGE_TYPE.RESET";
    }
  | {
      type: "INBOX.FACEBOOK.MESSAGE_TYPE.INITIATE";
      state: {
        showBanner: boolean;
        bannerState?: FacebookOTNStateDictEnum;
        validToken?: number;
        loading: boolean;
        showOverlay: boolean;
        hasHumanAgent: boolean;
        refreshFacebookOTNState: () => void;
      };
    }
  | {
      type: "INBOX.FACEBOOK.MESSAGE_TYPE.UPDATE";
      selectedType: MessageTypeSelectedType;
      value: string;
      selectedOption: OptionType;
    }
  | {
      type: "INBOX.FACEBOOK.MESSAGE_TYPE.SHOW_MODAL";
    }
  | {
      type: "INBOX.FACEBOOK.MESSAGE_TYPE.HIDE_MODAL";
    }
  | {
      type: "INBOX.FACEBOOK.MESSAGE_TYPE.SHOW_OVERLAY";
    }
  | {
      type: "INBOX.FACEBOOK.MESSAGE_TYPE.HIDE_OVERLAY";
    }
  | {
      type: "INBOX.FACEBOOK.MESSAGE_TYPE.SHOW_MESSAGETAG";
    };

export type MessageTypeSelectedType = "facebookOTN" | "messageTag";

export const facebookReducer = produce(
  (state: LoginType = initialUser, action: Action) => {
    const stateFb = state.inbox.facebook;

    switch (action.type) {
      case "INBOX.FACEBOOK.MESSAGE_TYPE.RESET":
        stateFb.messageType = defaultMessageTypeState();
        break;
      case "INBOX.FACEBOOK.MESSAGE_TYPE.INITIATE":
        stateFb.messageType = {
          ...defaultMessageTypeState(),
          ...action.state,
        };
        break;
      case "INBOX.FACEBOOK.MESSAGE_TYPE.UPDATE":
        stateFb.messageType = {
          ...stateFb.messageType,
          type: action.selectedType,
          value: action.value,
          showOverlay: false,
          showModal: false,
          showMessageTag: true,
          selectedOption: action.selectedOption,
        };
        break;
      case "INBOX.FACEBOOK.MESSAGE_TYPE.SHOW_MODAL":
        stateFb.messageType.showModal = true;
        break;
      case "INBOX.FACEBOOK.MESSAGE_TYPE.HIDE_MODAL":
        stateFb.messageType.showModal = false;
        break;
      case "INBOX.FACEBOOK.MESSAGE_TYPE.SHOW_OVERLAY":
        stateFb.messageType.showOverlay = true;
        break;
      case "INBOX.FACEBOOK.MESSAGE_TYPE.HIDE_OVERLAY":
        stateFb.messageType.showOverlay = false;
        break;
    }
  }
);
