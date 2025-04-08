import * as React from "react";
import {
  defaultState,
  SettingUserState,
  SettingUserAction,
} from "./settingUserReducer";

type SettingUserContextType = {
  state: SettingUserState;
  dispatch: (action: SettingUserAction) => any;
};

export const SettingUserContext = React.createContext<SettingUserContextType>({
  state: defaultState(),
  dispatch: (action: SettingUserAction) => {},
});
