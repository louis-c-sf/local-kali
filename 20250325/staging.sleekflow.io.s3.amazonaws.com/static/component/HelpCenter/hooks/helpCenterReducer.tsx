import {
  HelpCenterStateType,
  HelpCenterActionType,
  getDefaultStateValue,
  getDefaultFormValue,
} from "./HelpCenterStateType";
import produce from "immer";
import { StepsEnum } from "./HelpCenterStateType";

export const helpCenterReducer = produce(
  (state: HelpCenterStateType, action: HelpCenterActionType) => {
    switch (action.type) {
      case "SHOW_HELP_CENTER_WIDGET":
        state.helpCenterWidgetVisible = true;
        state.step = action.step ? action.step : StepsEnum.Main;
        break;
      case "HIDE_HELP_CENTER_WIDGET":
        state.helpCenterWidgetVisible = false;
        break;
      case "UPDATE_STEP":
        state.step = action.step;
        break;
      case "RESET_STATE":
        return getDefaultStateValue();
      case "UPDATE_SEARCH":
        state.search = action.search;
        break;
      case "RESET_FORM":
        state.form = getDefaultFormValue();
        break;
      case "UPDATE_FORM":
        state.form = action.form;
        break;
      case "UPDATE_TICKET_NO":
        state.ticketNo = action.ticketNo;
        break;
    }
  }
);
