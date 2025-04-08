import { createContext } from "react";
import { HashTagCountedType } from "../../../../types/ConversationType";
import { UserProfileGroupType } from "../../../../container/Contact/Imported/UserProfileGroupType";
import { GetErrorsInterface } from "./FilterGroupFieldType";

export type FilterGroupContextType = {
  tagsAvailable: HashTagCountedType[];
  listsAvailable: UserProfileGroupType[];
  visible: boolean;
  getFieldErrors: GetErrorsInterface;
  isErrorsVisible: boolean;
  currenciesSupported: string[];
};

export const FilterGroupContext = createContext<FilterGroupContextType>({
  listsAvailable: [],
  currenciesSupported: [],
  tagsAvailable: [],
  visible: false,
  isErrorsVisible: false,
  getFieldErrors: () => undefined,
});
