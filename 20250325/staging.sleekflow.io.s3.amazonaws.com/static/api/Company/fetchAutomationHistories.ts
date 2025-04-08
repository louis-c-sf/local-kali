import {
  AutomationHistoryResponseType,
  AutomationHistoriesFilterParamsType,
  AutomationHistoriesPaginationParamsType,
} from "../../types/AssignmentRuleType";
import { GET_AUTOMATION_HISTORIES } from "../apiPath";
import { get } from "../apiRequest";

export default async function fetchAutomationHistories(
  automationId: string,
  param: AutomationHistoriesPaginationParamsType &
    AutomationHistoriesFilterParamsType
) {
  const automationHistoriesResult: AutomationHistoryResponseType = await get(
    GET_AUTOMATION_HISTORIES.replace("{automationId}", automationId),
    {
      param,
    }
  );
  return automationHistoriesResult;
}
