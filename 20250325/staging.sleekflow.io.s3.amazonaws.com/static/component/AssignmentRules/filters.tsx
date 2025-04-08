import AssignmentResponseType, {
  AssignmentRuleType,
} from "../../types/AssignmentRuleType";
import {
  AutomationActionType,
  AutomationActionTypeEnum,
} from "../../types/AutomationActionType";

export function isDefaultAssignmentRule(
  assignmentRule: AssignmentResponseType | AssignmentRuleType
): boolean {
  if (typeof assignmentRule.isDefault === "boolean") {
    return assignmentRule.isDefault;
  }

  return false;
}

export function isActionPresent(
  type: AutomationActionTypeEnum,
  list: AutomationActionType[]
) {
  return list.some((a) => a.automatedTriggerType === type);
}
