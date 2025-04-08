import { createContext } from "react";
import {
  inboxDemoStateType,
  defaultState,
  inboxDemoActionType,
} from "./inboxDemoReducer";

interface SignupContextType extends inboxDemoStateType {
  demoDispatch: React.Dispatch<inboxDemoActionType>;
}
const defaultContextState = {
  ...defaultState,
  demoDispatch: () => {},
};
const InboxDemoContext = createContext<SignupContextType>({
  ...defaultContextState,
});

export default InboxDemoContext;
