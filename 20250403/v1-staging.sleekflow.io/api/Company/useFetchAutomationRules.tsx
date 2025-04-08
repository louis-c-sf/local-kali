import { useState, useCallback, useEffect, useRef } from "react";
import {
  denormalizeAutomationRule,
  withActionsDenormalized,
} from "../../component/AssignmentRules/AutomationRuleEdit/denormalizeAutomationRule";
import { useConditionFieldBuilder } from "../../component/AssignmentRules/AutomationRuleEdit/useConditionFieldBuilder";
import { filterLiveAssignmentRule } from "../../component/AssignmentRules/AutomationTable";
import AssignmentResponseType, {
  AssignmentRuleType,
} from "../../types/AssignmentRuleType";
import fetchAutomationRules from "./fetchAutomationRules";
import { useAppDispatch, useAppSelector } from "../../AppRootContext";
import { equals, mergeRight, uniq } from "ramda";
import {
  AutomationActionType,
  isSendMessageAction,
} from "types/AutomationActionType";
import fetch360DialogWaba from "./fetch360DialogWaba";
import { useWhatsappTemplates } from "container/Settings/OfficialWhatsApp/useWhatsappTemplates";
import fetchCloudAPIWaba from "./fetchCloudAPIWaba";
import { NormalizedWhatsAppTemplateType } from "features/Whatsapp360/models/OptInType";

export default function useFetchAutomationRules() {
  const automationRules = useAppSelector((s) => s.automationRules, equals);
  const companyId = useAppSelector((s) => s.company?.id);
  const booted = useAppSelector((s) => s.automations.booted);
  const loginDispatch = useAppDispatch();
  const [automationRulesLoading, setAutomationRulesLoading] = useState(!booted);
  const { fieldFactory } = useConditionFieldBuilder();
  const { fetch360Templates, fetchCloudApiTemplates } = useWhatsappTemplates();
  const mergedTemplates = useRef<NormalizedWhatsAppTemplateType>();

  function updateAutomationRules(assignmentRules: AssignmentRuleType[]) {
    loginDispatch({
      type: "AUTOMATIONS_LOAD_COMPLETE",
      automationRules: assignmentRules,
    });
  }
  function is360DialogActionExist(action: AutomationActionType) {
    return (
      isSendMessageAction(action) &&
      action.whatsApp360DialogExtendedAutomationMessages?.some(
        (a) => a.whatsapp360DialogTemplateMessage
      )
    );
  }
  function isCloudAPIActionExist(action: AutomationActionType) {
    return (
      isSendMessageAction(action) &&
      action.extendedAutomationMessage?.whatsappCloudApiByWabaExtendedAutomationMessages?.some(
        (s) =>
          s.extendedMessagePayloadDetail.whatsappCloudApiTemplateMessageObject
      )
    );
  }
  async function updateCloudAPITemplates() {
    const wabaResult = await fetchCloudAPIWaba();
    const configIds = uniq(
      wabaResult.whatsappCloudApiByWabaIdConfigs.map((c) => ({
        wabaId: c.wabaAccountId,
        channelId: c.whatsappCloudApiConfigs[0].id,
      }))
    );
    const fetchCloudAPITemplateResponse = await Promise.all(
      configIds.map((c) => fetchCloudApiTemplates(c.wabaId, false))
    );
    const mergedCloudAPITemplates =
      fetchCloudAPITemplateResponse.reduce(mergeRight);

    configIds.map((c, index) => {
      loginDispatch({
        type: "INBOX.WHATSAPP_CLOUDAPI.LOADED",
        channelId: c.channelId,
        templates: fetchCloudAPITemplateResponse[index],
      });
    });
    return mergedCloudAPITemplates;
  }
  async function update360DialogTemplate() {
    const wabaResult = await fetch360DialogWaba();
    if (wabaResult.whatsApp360DialogByWabaIdConfigs.length > 0) {
      const configIds = uniq(
        wabaResult.whatsApp360DialogByWabaIdConfigs
          .map((c) => c.whatsApp360DialogConfigs.map((config) => config.id))
          .flat(1)
      );

      const fetch360TemplateResponse = await Promise.all(
        configIds.map((id) => fetch360Templates(id))
      );
      const merged360Templates = fetch360TemplateResponse.reduce(mergeRight);
      loginDispatch({
        type: "INBOX.WHATSAPP_360TEMPLATE.LOADED",
        templates: merged360Templates,
      });
      return merged360Templates;
    }
  }
  async function fetchAutomationRulesTemplates(
    rules: AssignmentResponseType[]
  ) {
    const hasSendMessage360Actions = rules?.some((s) =>
      s.automationActions.some(is360DialogActionExist)
    );
    const hasSendCloudAPIActions = rules?.some((s) =>
      s.automationActions.some(isCloudAPIActionExist)
    );
    if (hasSendCloudAPIActions) {
      const cloudAPITemplateResult = await updateCloudAPITemplates();
      mergedTemplates.current = {
        ...mergedTemplates.current,
        ...cloudAPITemplateResult,
      };
    }
    if (hasSendMessage360Actions) {
      const dialogTemplateResult = await update360DialogTemplate();
      mergedTemplates.current = {
        ...mergedTemplates.current,
        ...dialogTemplateResult,
      };
    }
  }
  async function refreshAutomationRules(): Promise<AssignmentResponseType[]> {
    try {
      setAutomationRulesLoading(true);
      const automationRulesResponse = await fetchAutomationRules(companyId);
      updateAutomationRules(
        automationRulesResponse.map((rule) =>
          withActionsDenormalized(denormalizeAutomationRule(rule, fieldFactory))
        )
      );

      await fetchAutomationRulesTemplates(automationRulesResponse);
      updateAutomationRules(
        automationRulesResponse.map((rule) =>
          withActionsDenormalized(
            denormalizeAutomationRule(rule, fieldFactory, {
              ...mergedTemplates.current,
            })
          )
        )
      );
      return automationRulesResponse;
    } catch (error) {
      console.error(`fetchAutomationRules error ${error}`);
    } finally {
      setAutomationRulesLoading(false);
    }
    return [];
  }
  function getLiveData() {
    return automationRules?.filter(filterLiveAssignmentRule).length ?? 0;
  }
  const denormalizeRule = useCallback(
    (rule: AssignmentResponseType) => {
      return withActionsDenormalized(
        denormalizeAutomationRule(rule, fieldFactory, {
          ...mergedTemplates.current,
        })
      );
    },
    [fieldFactory, JSON.stringify(mergedTemplates.current)]
  );

  return {
    refreshAutomationRules,
    automationRules,
    updateAutomationRules,
    getLiveData,
    automationRulesLoading,
    fetchAutomationRulesTemplates,
    booted,
    denormalizeRule,
  };
}
