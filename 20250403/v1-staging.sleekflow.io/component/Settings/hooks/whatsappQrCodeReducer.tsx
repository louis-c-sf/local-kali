import produce from "immer";
import { AssignmentType } from "../SettingTeams/types/TeamsType";
import { QRCodeChannelsType, RowQRCodeInfo } from "../types/SettingTypes";

export type WhatsappQrCodeState = {
  assignments?: AssignmentType[];
  channels: QRCodeChannelsType[];
  downloadedQrCodeInfo: RowQRCodeInfo;
  isEdit: boolean;
  buttonLoading: boolean;
};

export type WhatsappQrCodeAction =
  | {
      type: "UPDATE_ASSIGNMENTS";
      assignments?: AssignmentType[];
    }
  | {
      type: "UPDATE_CHANNELS";
      channels: QRCodeChannelsType[];
    }
  | {
      type: "UPDATE_ALL_QRCODE_INFO";
      downloadedQrCodeInfo: RowQRCodeInfo;
    }
  | {
      type: "START_BUTTON_LOADING";
    }
  | {
      type: "END_BUTTON_LOADING";
    }
  | {
      type: "ENABLE_SAVE";
    }
  | {
      type: "DISABLE_SAVE";
    };

export const whatsappQrCodeReducer = produce(
  (state: WhatsappQrCodeState, action: WhatsappQrCodeAction) => {
    switch (action.type) {
      case "UPDATE_ASSIGNMENTS":
        state.assignments = action.assignments;
        break;

      case "UPDATE_CHANNELS":
        state.channels = action.channels;
        break;

      case "UPDATE_ALL_QRCODE_INFO":
        state.downloadedQrCodeInfo = action.downloadedQrCodeInfo;
        break;

      case "START_BUTTON_LOADING":
        state.buttonLoading = true;
        break;

      case "END_BUTTON_LOADING":
        state.buttonLoading = false;
        break;

      case "ENABLE_SAVE":
        state.isEdit = true;
        break;

      case "DISABLE_SAVE":
        state.isEdit = false;
        break;
    }
  }
);

export const whatsappQrCodeInfoReducer: React.Reducer<
  WhatsappQrCodeState,
  WhatsappQrCodeAction
> = whatsappQrCodeReducer;

export function defaultState(): WhatsappQrCodeState {
  return {
    assignments: [],
    channels: [],
    downloadedQrCodeInfo: {},
    isEdit: false,
    buttonLoading: false,
  };
}
