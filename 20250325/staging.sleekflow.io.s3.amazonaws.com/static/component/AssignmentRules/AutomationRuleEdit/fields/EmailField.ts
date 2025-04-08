import { ChoiceField } from "./ChoiceField";
import { DropdownOptionType } from "../../../Chat/ChannelFilterDropdown";

export class EmailField extends ChoiceField {
  constructor(fieldName: string, fieldDisplayName: string) {
    super("Email", fieldName, fieldDisplayName, []);
  }

  protected allowsExtraChoices() {
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
