import { ChoiceField } from "./ChoiceField";
import {
  ConditionNameType,
  LANGUAGE_FIELD_NAME,
  LANGUAGE_FIELD_TYPE,
} from "config/ProfileFieldMapping";
import { LogicType } from "types/AssignmentRuleType";

export class LanguageField extends ChoiceField {
  protected conditionOperator: ConditionNameType = "Contains";
  protected conditionLogic: LogicType = "And";

  constructor(fieldDisplayName: string) {
    super(LANGUAGE_FIELD_TYPE, LANGUAGE_FIELD_NAME, fieldDisplayName, []);
  }

  isMultiple(): boolean {
    return true;
  }

  protected allowsAnyValue(): boolean {
    return true;
  }
}
