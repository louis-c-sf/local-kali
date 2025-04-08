import React, { createContext, Reducer, useReducer } from "react";
import {
  HelpCenterStateType,
  HelpCenterActionType,
  getDefaultStateValue,
} from "./HelpCenterStateType";

type HelpCenterContextType = {
  state: HelpCenterStateType;
  dispatch: (action: HelpCenterActionType) => any;
};
export const HelpCenterContext = createContext<HelpCenterContextType>({
  state: { ...getDefaultStateValue() },
  dispatch: () => {},
});
