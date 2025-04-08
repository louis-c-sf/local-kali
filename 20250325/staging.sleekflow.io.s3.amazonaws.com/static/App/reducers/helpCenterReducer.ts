import { Action, LoginType } from "../../types/LoginType";
import produce from "immer";
import { initialUser } from "../../context/LoginContext";
import { StepsEnum } from "../../component/HelpCenter/hooks/HelpCenterStateType";

export function defaultHelpCenterState() {
  return {
    visible: false,
    step: "",
  };
}

export type HelpCenterStateType = {
  visible: boolean;
  step: string;
};

export type HelpCenterActionType =
  | {
      type: "SHOW_HELP_CENTER_TICKET";
    }
  | {
      type: "HIDDEN_HELP_CENTER";
    };

export const helpCenterReducer = produce(
  (state: LoginType = initialUser, action: Action) => {
    switch (action.type) {
      case "SHOW_HELP_CENTER_TICKET":
        state.helpCenter.visible = true;
        state.helpCenter.step = StepsEnum.New;
        break;
      case "HIDDEN_HELP_CENTER":
        state.helpCenter.visible = false;
        state.helpCenter.step = "";
    }
  }
);
