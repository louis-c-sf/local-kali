import { createContext } from "react";
import {
  CrmOnboardingStateType,
  defaultState,
  CrmOnboardingActionType,
} from "./onboardingReducer";

interface CrmOnboardingContextType extends CrmOnboardingStateType {
  onboardingDispatch: React.Dispatch<CrmOnboardingActionType>;
}
const defaultContextState = {
  ...defaultState(),
  onboardingDispatch: () => {},
};
const CrmOnboardingContext = createContext<CrmOnboardingContextType>({
  ...defaultContextState,
});

export default CrmOnboardingContext;
