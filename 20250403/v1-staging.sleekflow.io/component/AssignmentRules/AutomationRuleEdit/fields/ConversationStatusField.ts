import { ChoiceField } from "./ChoiceField";
import { DropdownOptionType } from "../../../Chat/ChannelFilterDropdown";
import { CompoundConditionType } from "../../../../types/AssignmentRuleType";

export class ConversationStatusField extends ChoiceField {
  constructor(fieldDisplayName: string, choices: DropdownOptionType[]) {
    super(
      "ConversationStatus",
      "ConversationStatus",
      fieldDisplayName,
      choices
    );
  }

  protected buildDefaultCondition(): CompoundConditionType {
    return {
      conditionOperator: "Equals",
      fieldName: "ConversationStatus",
      nextOperator: "And",
      values: ["open"],
    };
  }

  isMultiple(): boolean {
    return ["Contains", "IsNotContains"].includes(this.conditionOperator);
  }
}
