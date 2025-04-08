import React, { createContext } from "react";

interface IndividualProfileContextType {
  isDisplayMessage: boolean;
  individualProfileDispatch: Function;
}
export const defaultProfileType = { isDisplayMessage: false };
const IndividualProfileContext = createContext<IndividualProfileContextType>({
  ...defaultProfileType,
  individualProfileDispatch: () => {},
});

export default IndividualProfileContext;
