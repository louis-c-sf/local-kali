import { createContext } from "react";
import {
  migrateNumberDefaultState,
  MigrateNumberType,
  MigrateNumberActionType,
} from "./reducer/migrateReducer";

export interface MigrateNumberContextType extends MigrateNumberType {
  dispatch: React.Dispatch<MigrateNumberActionType>;
}
export const defaultContextState = {
  ...migrateNumberDefaultState,
  dispatch: () => {},
};
export const MigrateNumberContext = createContext<MigrateNumberContextType>({
  ...defaultContextState,
});
