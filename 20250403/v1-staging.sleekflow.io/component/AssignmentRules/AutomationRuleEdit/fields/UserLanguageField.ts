import { ChoiceField } from "./ChoiceField";
import { DropdownOptionType } from "../../../Chat/ChannelFilterDropdown";

export class UserLanguageField extends ChoiceField {
  constructor(fieldType: string, fieldName: string, fieldDisplayName: string) {
    super(fieldType, fieldName, fieldDisplayName, []);
  }

  isMultiple(): boolean {
    return true;
  }

  protected allowsAnyValue(): boolean {
    return true;
  }
}
