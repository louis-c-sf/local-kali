import { createContext } from "react";
import { SignupState, defaultState, SignupAction } from "./signupReducer";

interface SignupContextType extends SignupState {
  signupDispatch: React.Dispatch<SignupAction>;
}
const defaultContextState = {
  ...defaultState,
  signupDispatch: () => {},
};
const SignupContext = createContext<SignupContextType>({
  ...defaultContextState,
});

export default SignupContext;
