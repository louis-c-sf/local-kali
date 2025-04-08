import { DynamicChoiceField } from "./DynamicChoiceField";
import {
  AssignmentRuleRequestType,
  AutomationConditionType,
} from "../../../../types/AssignmentRuleType";

export class RegexField extends DynamicChoiceField {
  constructor(fieldName: string, fieldDisplayName: string) {
    super("regex", fieldName, fieldDisplayName);
  }

  applyToRequest(draftRequest: AssignmentRuleRequestType, index: number) {
    const condition = this.toConditionType() as AutomationConditionType;
    condition.fieldName = "Message";
    draftRequest.conditions?.push(condition);
  }
}
