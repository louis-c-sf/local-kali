import {
  AssignmentRuleRequestType,
  AssignmentRuleFormType,
} from "../../../types/AssignmentRuleType";
import { AutomationRuleGuard } from "./AutomationRuleGuard";
import produce from "immer";
import CompanyType from "../../../types/CompanyType";
import { toRecurringSetting } from "./denormalizeAutomationRule";
import { padStart } from "lodash-es";
import {
  AddConversationNoteAutomationActionType,
  AssignmentAutomationActionType,
  AutomationActionType,
  isAddConversationNoteAction,
  isAssignAction,
  isSendMediaAction,
  isSendMessageAction,
  isWaitableDenormalized,
  SendMediaAutomationActionType,
  SendMessageAutomationActionType,
  WaitableDenormalized,
  WaitableNormalized,
  isFacebookReplyCommentAction,
  isInstagramReplyCommentAction,
  isFacebookInitiateDmAction,
  isInstagramInitiateDmAction,
} from "../../../types/AutomationActionType";
import {
  FacebookInitiateDmActionType,
  FacebookReplyCommentActionType,
  InstagramInitiateDmActionType,
  InstagramReplyCommentActionType,
  MessageFormatEnum,
} from "./CreateRule/FbIg/PostCommentTypes";
import { getCompanyCustomFieldNames } from "../../../container/Contact/hooks/useCustomProfileFields";
import {
  TemplateMessageComponentType,
  Whatsapp360DialogTemplateMessageComponentBodyType,
} from "../../../types/MessageType";
import {
  format360DialogOfficialTemplateParam,
  formatWhatsApp360DialogMessage,
} from "../../../api/Broadcast/buildSaveCampaignRequest";
import { replaceParamTokens } from "../../Broadcast/NewBroadcastHeader/replaceParamTokens";

import {
  ButtonType,
  InteractiveMessageValues,
} from "component/Chat/InteractiveMessage/InteractiveMessageSchema";
import uuid from "uuid";
import { normalize360DialogComponents } from "../../../api/Broadcast/normalize360DialogComponents";
import { extractTemplateName } from "lib/utility/getTemplateResponseKey";

//todo make all dependencies required
export function buildAutomationRequest(
  rule: AssignmentRuleFormType,
  saveGuard: AutomationRuleGuard,
  company?: CompanyType
): AssignmentRuleRequestType {
  return produce(
    {} as AssignmentRuleRequestType,
    (draft: AssignmentRuleRequestType) => {
      draft.automationType = rule.automationType;
      draft.status = rule.status;
      draft.conditions = [];
      draft.automationActions = [];
      draft.targetedChannelWithIds = [];

      if (rule.isPreview) {
        draft.isPreview = rule.isPreview;
      }

      if (saveGuard.isDefaultRule()) {
        draft.assignmentRuleName = "Default";
        draft.order = 0;
        draft.isContinue = false;
      } else {
        draft.assignmentRuleName = rule.ruleName ?? "";
        draft.order = rule.order;
        draft.isContinue = rule.isContinue;
      }

      if (rule.conditionFields && saveGuard.canHaveConditions()) {
        rule.conditionFields.forEach((fld, i) => {
          fld.applyToRequest(draft, i);
        });

        if (rule.schedule && saveGuard.canHaveSchedule()) {
          draft.recurringSetting = toRecurringSetting(rule.schedule);
        }
      }
      //Fb/IG conditions
      if (
        rule.postCommentConditionFields &&
        saveGuard.canHavePostCommentCondition(rule.automationType)
      ) {
        draft.assignmentType = "Unassigned";
        delete draft.targetedChannelWithIds;
        draft.conditions.push({
          fieldName: "pageid",
          conditionOperator: "Equals",
          values: [rule.postCommentConditionFields.pageId],
        });
        if (!rule.isPreview || rule.postCommentConditionFields.postId !== "") {
          draft.conditions.push({
            fieldName: "postid",
            conditionOperator: "Equals",
            values: [rule.postCommentConditionFields.postId],
          });
        }
        if (
          rule.postCommentConditionFields.keywords &&
          rule.postCommentConditionFields.keywords?.length > 0
        ) {
          draft.conditions.push({
            fieldName: "keywords",
            conditionOperator: "Contains",
            values: rule.postCommentConditionFields.keywords,
          });
        }
      }

      const isDefaultRule = saveGuard.isDefaultRule();
      const assignAction = rule.automationActions.find(isAssignAction);
      if (isDefaultRule && assignAction) {
        if (assignAction.teamId) {
          draft.teamAssignmentType =
            assignAction.assignmentType.charAt(0).toUpperCase() +
            assignAction.assignmentType.slice(1);
          draft.assignmentType = "SpecificGroup";
        } else {
          draft.assignmentType = assignAction.assignmentType;
        }
        draft.staffId = String(assignAction.staffId);
      }
      const toActionsDenormalized = getNormalizeActionsReducer(
        isDefaultRule,
        rule.automationActions,
        company
      );
      const validActions = rule.automationActions.reduce(
        toActionsDenormalized,
        []
      );
      draft.automationActions = validActions.map((act, i) => ({
        ...act,
        order: i,
      }));
    }
  );
}

export function getNormalizeActionsReducer(
  isDefaultRule: boolean,
  allActions: readonly AutomationActionType[],
  company?: CompanyType
) {
  return (
    acc: AutomationActionType[],
    action: AutomationActionType,
    i: number
  ) => {
    if (isAssignAction(action) && i === allActions.findIndex(isAssignAction)) {
      if (isDefaultRule) {
        if (action.teamId) {
          return [...acc, normalizeRuleAction(action)];
        }
        return acc;
      } else {
        return [...acc, normalizeRuleAction(action)];
      }
    }

    if (isSendMessageAction(action) || isAddConversationNoteAction(action)) {
      return [
        ...acc,
        normalizeSendMessageAction(normalizeRuleAction(action), company),
      ];
    }

    if (
      isFacebookReplyCommentAction(action) ||
      isInstagramReplyCommentAction(action)
    ) {
      return [...acc, normalizeReplyCommentAction(normalizeRuleAction(action))];
    }

    if (
      isFacebookInitiateDmAction(action) ||
      isInstagramInitiateDmAction(action)
    ) {
      return [...acc, normalizeInitiateDmAction(normalizeRuleAction(action))];
    }
    return [...acc, normalizeRuleAction(action)];
  };
}

function normalizeRuleAction<T extends AutomationActionType>(action: T): T {
  let normalized: AutomationActionType = action;
  if (isWaitableDenormalized(normalized)) {
    normalized = normalizeWaitAction(normalized);
  }
  if (isAssignAction(normalized)) {
    return normalizeAssignAction(normalized) as T;
  }
  if (isSendMediaAction(normalized)) {
    const normalizedRule: SendMediaAutomationActionType = {
      ...normalized,
      uploadedFiles: [],
    };
    return normalizedRule as T;
  }
  return normalized as T;
}

function normalizeAssignAction(
  action: AssignmentAutomationActionType
): AssignmentAutomationActionType {
  if (action.teamId) {
    return {
      ...action,
      teamAssignmentType: action.assignmentType,
      assignmentType: "SpecificGroup",
    };
  }
  const { assignedTeam, ...actionWithoutTeamData } = action;
  return {
    ...actionWithoutTeamData,
    teamAssignmentType: null,
    teamId: null,
  };
}
function normalizeSendMessageAction<
  T extends
    | SendMessageAutomationActionType
    | AddConversationNoteAutomationActionType
>(action: T, company?: CompanyType): T {
  const profileFieldNames = company ? getCompanyCustomFieldNames(company) : [];
  const sendMessageAction = isSendMessageAction(action) ? action : undefined;
  let param = {
    ...action,
  };
  if (sendMessageAction?.sendWhatsappTemplate?.templateContent) {
    const normalizedComponents:
      | Array<TemplateMessageComponentType>
      | undefined = normalize360DialogComponents(
      sendMessageAction.sendWhatsappTemplate.templateContent,
      sendMessageAction.sendWhatsappTemplate
    );
    const { components, checkParams } = format360DialogOfficialTemplateParam(
      normalizedComponents ?? [],
      profileFieldNames
    );
    const whatsapp360dialogRequest = formatWhatsApp360DialogMessage(
      sendMessageAction.channelType ?? "",
      sendMessageAction.sendWhatsappTemplate,
      sendMessageAction.sendWhatsappTemplate.templateName ?? "",
      sendMessageAction.sendWhatsappTemplate.templateLanguage ?? "",
      components
    );
    const bodyComponents = components?.find(
      (c) => c.type === "body"
    ) as Whatsapp360DialogTemplateMessageComponentBodyType;
    let messageContent =
      sendMessageAction.sendWhatsappTemplate.templateContent.content;
    bodyComponents?.parameters.forEach((p, index) => {
      messageContent = messageContent.replace(`{{${index + 1}}}`, p.text);
    });
    param = {
      ...action,
      messageContent: messageContent,
      messageParams: checkParams,
    };
    // template content match regex to replace body paramenters
    if (
      sendMessageAction.channelType === "whatsappcloudapi" ||
      (sendMessageAction.extendedAutomationMessage?.messageType ===
        "template" &&
        sendMessageAction.extendedAutomationMessage.whatsappCloudApiByWabaExtendedAutomationMessages?.some(
          (s) =>
            s.extendedMessagePayloadDetail.whatsappCloudApiTemplateMessageObject
        ))
    ) {
      const language =
        sendMessageAction.sendWhatsappTemplate.templateLanguage ?? "";
      return {
        ...param,
        extendedAutomationMessage: {
          channel: "whatsappcloudapi",
          messageType: "template",
          whatsappCloudApiByWabaExtendedAutomationMessages: [
            {
              messagingHubWabaId:
                sendMessageAction.sendWhatsappTemplate.wabaAccountId,
              extendedMessagePayloadDetail: {
                whatsappCloudApiTemplateMessageObject: {
                  templateName: extractTemplateName({
                    templateName:
                      sendMessageAction.sendWhatsappTemplate.templateName ?? "",
                    language,
                    channel: "whatsappcloudapi",
                  }),
                  language,
                  components,
                },
              },
            },
          ],
        },
        whatsApp360DialogExtendedAutomationMessages: [],
      };
    }
    return {
      ...param,
      whatsApp360DialogExtendedAutomationMessages: [
        {
          ...whatsapp360dialogRequest,
          wabaAccountId:
            sendMessageAction.sendWhatsappTemplate.wabaAccountId === ""
              ? null
              : sendMessageAction.sendWhatsappTemplate.wabaAccountId,
        },
      ],
    };
  } else if (sendMessageAction?.sendInteractiveMessageState) {
    const { submitContent, checkParams } = replaceParamTokens(
      action.messageContent,
      profileFieldNames
    );

    const whatsapp360DialogInteractiveObject = normalizeInteractiveMessage(
      sendMessageAction.sendInteractiveMessageState,
      submitContent
    );
    param = {
      ...action,
      extendedAutomationMessage: undefined,
      sendInteractiveMessageState: undefined,
      messageContent: submitContent,
      messageParams: checkParams,
    };
    if (sendMessageAction?.sendInteractiveMessageState.buttonType === "none") {
      return {
        ...param,
      };
    }
    if (
      sendMessageAction.channelType === "whatsappcloudapi" ||
      (sendMessageAction.extendedAutomationMessage?.messageType ===
        "interactive" &&
        sendMessageAction.extendedAutomationMessage.whatsappCloudApiByWabaExtendedAutomationMessages?.some(
          (s) =>
            s.extendedMessagePayloadDetail.whatsappCloudApiInteractiveObject
        ))
    ) {
      return {
        ...param,
        extendedAutomationMessage: {
          channel: "whatsappcloudapi",
          messageType: "interactive",
          whatsappCloudApiByWabaExtendedAutomationMessages: [
            {
              messagingHubWabaId:
                sendMessageAction.sendInteractiveMessageState.wabaAccountId,
              extendedMessagePayloadDetail: {
                whatsappCloudApiInteractiveObject:
                  whatsapp360DialogInteractiveObject,
              },
            },
          ],
        },
        whatsApp360DialogExtendedAutomationMessages: [],
      };
    }
    return {
      ...param,
      whatsApp360DialogExtendedAutomationMessages:
        whatsapp360DialogInteractiveObject
          ? [
              {
                messageType: "interactive",
                whatsapp360DialogInteractiveObject,
                wabaAccountId:
                  sendMessageAction.sendInteractiveMessageState.wabaAccountId,
              },
            ]
          : undefined,
    };
  } else {
    const { submitContent, checkParams } = replaceParamTokens(
      action.messageContent,
      profileFieldNames
    );

    return {
      ...action,
      messageContent: submitContent,
      messageParams: checkParams,
      whatsApp360DialogExtendedAutomationMessages: undefined,
    };
  }
}

function normalizeReplyCommentAction<
  T extends FacebookReplyCommentActionType | InstagramReplyCommentActionType
>(action: T): T {
  return {
    ...action,
    assignmentType: "Unassigned",
  };
}

function normalizeInitiateDmAction<
  T extends FacebookInitiateDmActionType | InstagramInitiateDmActionType
>(action: T): T {
  if (action.fbIgAutoReply.messageFormat === MessageFormatEnum.Attachment) {
    delete action.fbIgAutoReply.fbIgAutoReplyFiles;
    delete action.fbIgAutoReply.messageContent;
  }
  return {
    ...action,
    assignmentType: "Unassigned",
  };
}

export function normalizeWaitAction(
  action: AutomationActionType & WaitableDenormalized
): AutomationActionType & WaitableNormalized {
  if (
    !action?.actionWaitDenormalized?.amount ||
    !action?.actionWaitDenormalized?.units
  ) {
    return {
      ...action,
      actionWait: null,
      actionWaitDays: null,
    };
  }

  let days: number | null = null;
  let waitString: string | null = null;

  const amount = action.actionWaitDenormalized.amount;

  switch (action.actionWaitDenormalized.units) {
    case "DAY":
      days = amount ?? null;
      break;

    case "HOUR":
      waitString = `${padStart(String(amount), 2, "0")}:00:00`;
      break;

    case "MINUTE":
      waitString = `00:${padStart(String(amount), 2, "0")}:00`;
      break;

    case "SECOND":
      waitString = `00:00:${padStart(String(amount), 2, "0")}`;
      break;
  }
  const result = {
    ...action,
    actionWait: waitString,
    actionWaitDays: days,
  };

  delete result.actionWaitDenormalized;

  return result;
}

export function buildNewAutomationRequest(
  rule: AssignmentRuleFormType,
  saveGuard: AutomationRuleGuard,
  company?: CompanyType
) {
  const newRequest = buildAutomationRequest(rule, saveGuard, company);
  return { ...newRequest, order: null };
}

function normalizeInteractiveMessage(
  values: InteractiveMessageValues,
  messageContent: string
) {
  if (!values.buttonType || values.buttonType === "none") {
    return undefined;
  }

  if (values.buttonType === ButtonType.QUICK_REPLY) {
    const quickReplyAction = values.quickReplies?.map((reply) => ({
      type: "reply",
      reply: {
        id: uuid(),
        title: reply,
      },
    }));

    return {
      type: "button",
      body: {
        type: "text",
        text: messageContent,
      },
      action: {
        buttons: quickReplyAction,
      },
    };
  }

  if (values.buttonType === ButtonType.LIST_MESSAGE) {
    const sections = values.listMessage?.sections.map((section) => ({
      title: section.title,
      rows: section.options.map((option) => ({
        id: uuid(),
        title: option.name,
        description: option.description,
      })),
    }));

    return {
      type: "list",
      body: {
        type: "text",
        text: messageContent,
      },
      action: {
        button: values.listMessage?.title,
        sections,
      },
    };
  }
}
