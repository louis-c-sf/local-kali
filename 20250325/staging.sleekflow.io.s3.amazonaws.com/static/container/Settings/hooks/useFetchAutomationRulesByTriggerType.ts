import AssignmentResponseType from "../../../types/AssignmentRuleType";
import { GET_ASSIGNMENT_RULES } from "../../../api/apiPath";
import { get } from "../../../api/apiRequest";
import { AutomationTriggerTypeEnum } from "../WhatsAppQrCode/types/WhatsAppQrCodeTypes";

export default function useFetchAutomationRulesByTriggerType() {
  const fetchAutomationRulesByTriggerType = async (
    triggerType: AutomationTriggerTypeEnum
  ) => {
    try {
      const assignmentRulesResult = await get(GET_ASSIGNMENT_RULES, {
        param: {
          triggerType,
        },
      });
      return assignmentRulesResult;
    } catch (e) {
      console.log("e: ", e);
    }
  };
  return {
    fetchAutomationRulesByTriggerType,
  };
}
