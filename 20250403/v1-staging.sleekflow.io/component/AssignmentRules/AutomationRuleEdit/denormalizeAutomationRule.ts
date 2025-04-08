import { AbstractConditionField } from "./fields/AbstractConditionField";
import produce from "immer";
import moment from "moment";
import AssignmentResponseType, {
  AssignmentRuleType,
  AssignmentScheduleType,
  flattenCondition,
  RecurringSettingType,
} from "../../../types/AssignmentRuleType";
import {
  AutomationActionType,
  isAddConversationNoteAction,
  isAssignAction,
  isSendMessageAction,
  isValidAutomationAction,
  isWaitable,
  orderableActionDefaults,
  waitableActionDefaults,
  WaitableDenormalized,
  WaitableNormalized,
  WaitActionType,
  WaitTimeUnitType,
} from "../../../types/AutomationActionType";
import { splitAt } from "ramda";
import { transformToEditableContent } from "../../Broadcast/BroadcastContent/transformToEditableContent";
import { denormalizeSendWhatsApp } from "./actions/SendWhatsApp360DialogMessage/SendWhatsApp360DialogMessage";
import { denormalizeInteractiveMessageRule } from "./actions/SendWhatsApp360DialogMessage/InteractiveMessage/helpers";
import { NormalizedWhatsAppTemplateType } from "features/Whatsapp360/models/OptInType";
import { FieldFactoryType } from "./contracts/FieldFactoryType";
import uuid from "uuid";

export function toRecurringSetting(
  schedule: AssignmentScheduleType
): RecurringSettingType {
  const time = schedule.time?.utcOffset(0);
  const emptyValue = {
    minutes: time?.minutes() ?? 0,
    hours: time?.hours() ?? 0,
    dayOfWeek: null,
    dayOfMonth: null,
    month: null,
  };

  switch (schedule.type) {
    case "DAY":
      return {
        ...emptyValue,
      };

    case "WEEK":
      return {
        ...emptyValue,
        dayOfWeek: schedule.amount,
      };

    case "MONTH":
      return {
        ...emptyValue,
        dayOfMonth: schedule.amount,
      };

    case "YEAR":
      return {
        ...emptyValue,
        month: schedule.amount,
      };
  }
  return emptyValue;
}

function toSchedule(
  recurringSetting: RecurringSettingType
): AssignmentScheduleType {
  let time = moment({ hour: 0, minute: 0 }).utcOffset(0, true);

  if (recurringSetting.hours !== null && recurringSetting.minutes !== null) {
    time = moment({
      hour: recurringSetting.hours,
      minute: recurringSetting.minutes,
    }).utcOffset(0, true);
  }

  if (recurringSetting.month) {
    return { type: "YEAR", amount: recurringSetting.month, time };
  } else if (recurringSetting.dayOfMonth) {
    return { type: "MONTH", amount: recurringSetting.dayOfMonth, time };
  } else if (recurringSetting.dayOfWeek) {
    return { type: "WEEK", amount: recurringSetting.dayOfWeek, time };
  }

  return { type: "DAY", time, amount: [] };
}

//todo make fieldFactory required, render component that calls toAutomationRuleFromResponse only after all dependencies are loaded
export function denormalizeAutomationRule(
  response: AssignmentResponseType,
  fieldFactory?: FieldFactoryType,
  templates?: NormalizedWhatsAppTemplateType
): AssignmentRuleType {
  let ruleTransformed: AssignmentRuleType = {
    id: response.assignmentId,
    automationType: response.automationType,
    automationActions: denormalizeRuleActions(
      response.automationActions,
      templates
    ),
    ruleName: response.assignmentRuleName,
    channelsWithIds: response.targetedChannelWithIds,
    conditions: mergeConditionsWithLegacyAssignmentData(response),
    updatedAt: response.updatedAt,
    isDefault: response.isDefault ?? false,
    status: response.status,
    schedule: response.recurringSetting
      ? toSchedule(response.recurringSetting)
      : undefined,
    order: response.order,
    conditionFields: [],
    triggeredCounter: response.triggeredCounter,
    triggeredFailedCounter: response.triggeredFailedCounter,
    triggeredSuccessCounter: response.triggeredSuccessCounter,
    isContinue: response.isContinue ?? false,
  };

  if (fieldFactory) {
    ruleTransformed.conditionFields = ruleTransformed.conditions.reduce<
      AbstractConditionField[]
    >((prev, next) => {
      try {
        const [precedingFields, [lastField]] = splitAt(-1, prev);
        if (lastField && lastField.canJoinCondition(next)) {
          return [...precedingFields, lastField.joinedWithCondition(next)];
        }
        const fieldFilled = fieldFactory(next, ruleTransformed);

        return prev.concat(fieldFilled);
      } catch (e) {
        console.error("#toAutomationRuleFromResponse", e);
        return prev;
      }
    }, []);
  }

  return postDenormalizeRule(ruleTransformed, response);
}

function postDenormalizeRule(
  rule: AssignmentRuleType,
  response: AssignmentResponseType
): AssignmentRuleType {
  if (rule.isDefault) {
    return produce(rule, (draft) => {
      const assignAction = draft.automationActions.find(isAssignAction);
      if (assignAction) {
        // add old format fields, to keep BC with new actions
        draft.assignmentType = assignAction.assignmentType;
        draft.assignedUser = assignAction.staffId;
      } else {
        if (response.assignmentType) {
          let assignedUserId = "";
          if (response.assignedStaff) {
            assignedUserId = response.assignedStaff?.userInfo?.id ?? "";
          }
          // convert found old record to a new format action
          draft.automationActions.unshift({
            automatedTriggerType: "Assignment",
            staffId: assignedUserId,
            assignmentType: response.assignmentType,
            teamId: null,
            actionWait: null,
            actionWaitDays: null,
            ...orderableActionDefaults(),
            ...waitableActionDefaults(),
          });
        }
      }
    });
  }
  return rule;
}

export function denormalizeRuleActions(
  actions: AutomationActionType[],
  templates?: NormalizedWhatsAppTemplateType
) {
  const actionsMerged = [...actions]
    .reduce<AutomationActionType[]>((acc, next) => {
      if (!isValidAutomationAction(next)) {
        // clean up garbage actions
        return acc;
      }
      if (isAssignAction(next)) {
        next.staffId = next?.assignedStaff?.userInfo?.id ?? "";
        if (next.assignedTeam?.id && next.teamAssignmentType) {
          next.teamId = next.assignedTeam.id;
          next.assignmentType = next.teamAssignmentType;
        }
      }
      if (isSendMessageAction(next)) {
        if (
          templates &&
          (next.whatsApp360DialogExtendedAutomationMessages ||
            next.extendedAutomationMessage
              ?.whatsappCloudApiByWabaExtendedAutomationMessages)
        ) {
          const templateTypeMessage =
            next.whatsApp360DialogExtendedAutomationMessages?.find(
              (s) => s.messageType === "template"
            );
          const cloudAPITemplateMessage =
            next.extendedAutomationMessage &&
            next.extendedAutomationMessage.messageType === "template"
              ? next.extendedAutomationMessage
              : undefined;
          if (templateTypeMessage || cloudAPITemplateMessage) {
            next.sendWhatsappTemplate = denormalizeSendWhatsApp(
              templates,
              next.messageParams,
              templateTypeMessage,
              cloudAPITemplateMessage
            );
          }
        }
        const interactiveMessagePayload =
          next.whatsApp360DialogExtendedAutomationMessages?.find(
            (s) => s.messageType === "interactive"
          )?.whatsapp360DialogInteractiveObject ||
          (next.extendedAutomationMessage?.messageType === "interactive" &&
            next.extendedAutomationMessage.whatsappCloudApiByWabaExtendedAutomationMessages?.find(
              (s) =>
                s.extendedMessagePayloadDetail.whatsappCloudApiInteractiveObject
            )?.extendedMessagePayloadDetail
              .whatsappCloudApiInteractiveObject) ||
          undefined;
        const whatsApp360DialogInteractiveMessage =
          next.whatsApp360DialogExtendedAutomationMessages?.find(
            (s) => s.messageType === "interactive"
          );
        const cloudApiInteractiveMessage =
          next.extendedAutomationMessage?.messageType === "interactive"
            ? next.extendedAutomationMessage.whatsappCloudApiByWabaExtendedAutomationMessages?.find(
                (s) =>
                  s.extendedMessagePayloadDetail
                    .whatsappCloudApiInteractiveObject
              )?.messagingHubWabaId
            : "";
        if (interactiveMessagePayload) {
          const interactiveMessageValue = denormalizeInteractiveMessageRule(
            interactiveMessagePayload
          );
          next.channelType = cloudApiInteractiveMessage
            ? "whatsappcloudapi"
            : "whatsapp360dialog";
          next.sendInteractiveMessageState = {
            wabaAccountId:
              whatsApp360DialogInteractiveMessage?.wabaAccountId ||
              cloudApiInteractiveMessage,
            ...interactiveMessageValue,
          };
        }
      }
      return [...acc, next];
    }, [])
    .map(denormalizeRuleAction);

  return actionsMerged.sort((a, b) => {
    return (a.order ?? 0) - (b.order ?? 0);
  });
}

function denormalizeRuleAction(action: AutomationActionType) {
  let denormalized: AutomationActionType = { ...action };
  if (isWaitable(action)) {
    denormalized = denormalizeWaitableAction(action);
  }
  denormalized.componentId = uuid();
  return denormalized;
}

function denormalizeTimePeriodString(action: string | null | undefined) {
  if (!action) {
    return null;
  }
  if (!action.match(/^(\d+\.)?(\d+:){1,2}\d+$/)) {
    return null;
  }

  let parts = action.split(/\.|:/).slice(0, 4);

  // add missing tail
  parts = Array(4 - parts.length)
    .fill("00")
    .concat(parts);

  const typeMap: WaitTimeUnitType[] = ["DAY", "HOUR", "MINUTE", "SECOND"];
  const match = parts.reduce<[number, WaitTimeUnitType] | undefined>(
    (found, next, index) => {
      if (found !== undefined) {
        return found;
      }
      const amount = Number(next);
      if (!isNaN(amount) && amount > 0) {
        return [amount, typeMap[index]];
      }
    },
    undefined
  );

  if (match !== undefined) {
    return {
      amount: match[0],
      units: match[1],
    };
  }
}

export function denormalizeWaitableAction(
  action: AutomationActionType & WaitableNormalized
): AutomationActionType & WaitableDenormalized {
  const timeWaitAction = denormalizeTimePeriodString(action.actionWait);
  let waitDenormalized: WaitActionType | undefined = undefined;
  const daysParsed = Number(action.actionWaitDays);

  if (timeWaitAction) {
    waitDenormalized = {
      units: timeWaitAction.units,
      amount: timeWaitAction.amount,
    };
  } else {
    if (!isNaN(daysParsed) && daysParsed > 0) {
      waitDenormalized = {
        units: "DAY",
        amount: daysParsed,
      };
    }
  }
  return { ...action, actionWaitDenormalized: waitDenormalized ?? null };
}

function mergeConditionsWithLegacyAssignmentData(
  assignmentRule: AssignmentResponseType
) {
  return produce(assignmentRule.conditions, (draft) => {
    if (assignmentRule.targetedChannelWithIds.length > 0) {
      const channelsConditionExist = draft.some((cndSet) => {
        const firstCondition = flattenCondition(cndSet)[0];
        return firstCondition?.fieldName === "LastChannel";
      });
      if (!channelsConditionExist) {
        draft.push({
          fieldName: "LastChannel",
          nextOperator: "And",
          values: [],
          conditionOperator: "Contains",
        });
      }
    }
  });
}

export function withActionsDenormalized(
  rule: AssignmentRuleType
): AssignmentRuleType {
  return produce(rule, (draft) => {
    draft.automationActions = unwrapMessageTemplates(draft.automationActions);
  });
}

export function unwrapMessageTemplates(
  actions: AutomationActionType[]
): AutomationActionType[] {
  return actions.map(denormalizeAutomationAction);
}

export function denormalizeAutomationAction(action: AutomationActionType) {
  if (!(isSendMessageAction(action) || isAddConversationNoteAction(action))) {
    return action;
  }
  return {
    ...action,
    messageContent: transformToEditableContent(
      action.messageContent,
      action.messageParams
    ),
  };
}
