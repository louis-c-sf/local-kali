import produce from "immer";
import { reduceReducers } from "../../../../utility/reduce-reducers";
import {
  AllCheckableAction,
  AllCheckableState,
  createCheckAllReducer,
} from "../../../../lib/reducers/checkAllReducer";
import {
  WhatsappQrCodeState,
  WhatsappQrCodeAction,
} from "../../hooks/whatsappQrCodeReducer";

export type SettingUserState = WhatsappQrCodeState & AllCheckableState<string>;

export type SettingUserAction =
  | WhatsappQrCodeAction
  | AllCheckableAction<string>;

const settingReducer = produce(
  (state: SettingUserState, action: SettingUserAction) => {
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

export const settingUserReducer: React.Reducer<
  SettingUserState,
  SettingUserAction
> = reduceReducers(settingReducer, createCheckAllReducer());

export function defaultState(): SettingUserState {
  return {
    assignments: [],
    channels: [],
    downloadedQrCodeInfo: {},
    isEdit: false,
    buttonLoading: false,
    checkableItems: {
      allChecked: false,
      allIds: [],
      checkedIds: [],
    },
  };
}
