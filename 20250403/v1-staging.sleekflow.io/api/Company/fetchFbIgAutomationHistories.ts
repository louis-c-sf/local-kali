import {
  FbIgAutomationHistoriesParamsType,
  FbIgAutomationHistoryResponseType,
} from "../../component/AssignmentRules/AutomationRuleEdit/CreateRule/FbIg/PostCommentTypes";
import {
  AutomationHistoriesFilterParamsType,
  AutomationHistoriesPaginationParamsType,
} from "../../types/AssignmentRuleType";
import { GET_FbIg_AUTOMATION_HISTORY } from "../apiPath";
import { get } from "../apiRequest";

export default async function fetchFbIgAutomationHistories(
  assignmentId: string,
  param: AutomationHistoriesPaginationParamsType &
    AutomationHistoriesFilterParamsType &
    FbIgAutomationHistoriesParamsType
) {
  const automationHistoriesResult: FbIgAutomationHistoryResponseType =
    await get(
      GET_FbIg_AUTOMATION_HISTORY.replace("{assignmentId}", assignmentId),
      {
        param,
      }
    );
  return automationHistoriesResult;
}
