import AssignmentResponseType from "../../types/AssignmentRuleType";
import { GET_ASSIGNMENT_RULES } from "../apiPath";
import { get } from "../apiRequest";

export default async function fetchAutomationRules(companyId?: string) {
  const assignmentRulesResult: AssignmentResponseType[] = await get(
    GET_ASSIGNMENT_RULES,
    {
      param: {
        offset: 0,
        limit:
          process.env.REACT_APP_ALLOW_MORE_AUTOMATION_RULES_COMPANY_ID ===
          companyId
            ? 700
            : 530,
      },
    }
  );
  return assignmentRulesResult;
}
