import { ChoiceField } from "./ChoiceField";
import { DropdownOptionType } from "../../../Chat/ChannelFilterDropdown";
import { CustomFieldTypeDict } from "../../../../types/ContactType";

export class DynamicChoiceField extends ChoiceField {
  constructor(
    fieldType: CustomFieldTypeDict | string,
    fieldName: string,
    fieldDisplayName: string
  ) {
    super(fieldType, fieldName, fieldDisplayName, []);
  }

  protected allowsExtraChoices(): boolean {
    return true;
  }

  isMultiple(): boolean {
    return true;
  }

  getChoices(): DropdownOptionType[] {
    const inputValue = this.toInputValueType();
    return [inputValue].flat(1).map((v, k) => ({
      value: v,
      text: v,
      key: k,
    }));
  }
}
