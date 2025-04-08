import { AutomationResponseType } from "../../types/AssignmentRuleType";
import { GET_ASSIGNMENT_RULE } from "../apiPath";
import { get } from "../apiRequest";

export default async function fetchAutomation(automationId: string) {
  const result: AutomationResponseType[] = await get(
    GET_ASSIGNMENT_RULE.replace("{assignmentRuleId}", automationId),
    {
      param: {},
    }
  );
  return result;
}
