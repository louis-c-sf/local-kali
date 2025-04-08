import {
  AudienceFilterConditionType,
  ChannelMessageType,
  TargetedChannelType,
  FilterConditionCommonType,
  SendWhatsappTemplateState,
} from "types/BroadcastCampaignType";
import { ChannelType } from "component/Chat/Messenger/types";
import { WhatsApp360DialogExtendedCampaignMessageType } from "./fetchBroadcastCampaign";
import {
  TemplateMessageComponentType,
  Whatsapp360DialogTemplateMessageComponentBodyType,
  Whatsapp360DialogTemplateMessageComponentHeaderParameterType,
  Whatsapp360DialogTemplateMessageComponentTextParameterType,
} from "types/MessageType";
import { replaceParamTokens } from "component/Broadcast/NewBroadcastHeader/replaceParamTokens";
import { extractContactListIdsFrom } from "component/Broadcast/BroadcastContent/extractContactListIdsFrom";
import { AutomationActionType } from "types/AutomationActionType";
import { BroadcastRequestType } from "./submitUpdateCampaign";
import { getNormalizeActionsReducer } from "component/AssignmentRules/AutomationRuleEdit/buildAutomationRequest";
import CompanyType from "../../types/CompanyType";
import { FacebookOTNBroadcastMapType } from "../../features/Facebook/models/FacebookOTNTypes";
import { normalize360DialogComponents } from "./normalize360DialogComponents";
import { PaymentLinkSetType } from "core/models/Ecommerce/Payment/PaymentLinkType";
import { ExtendedMessageType } from "core/models/Message/WhatsappCloudAPIMessageType";

export function format360DialogOfficialTemplateParam(
  components: Array<TemplateMessageComponentType>,
  fieldNames: string[]
) {
  const bodyParameter = components.find(
    (c) => c.type === "body"
  ) as Whatsapp360DialogTemplateMessageComponentBodyType;
  bodyParameter?.parameters.map((p) => p.text);
  let accuCheckParams: string[] = [];
  const updatedComponents = components.map((c) => {
    if (c.type === "header" && c.parameters?.some((c) => c.type === "image")) {
      return {
        ...c,
        parameters: c.parameters.map((p) => {
          if (p.type === "image") {
            const {
              type,
              image: { filename, ...rest },
            } = p;
            return {
              type,
              image: {
                ...rest,
              },
            };
          }
          return p;
        }) as Whatsapp360DialogTemplateMessageComponentHeaderParameterType[],
      };
    }
    if (c.type === "header" && c.parameters?.some((c) => c.type === "text")) {
      return {
        ...c,
        parameters: c.parameters.map((p) => {
          if (p.type === "text") {
            const { submitContent, checkParams } = replaceParamTokens(
              p.text,
              fieldNames,
              accuCheckParams.length
            );
            accuCheckParams = [...accuCheckParams, ...checkParams];
            return {
              type: "text",
              text: submitContent,
            };
          }
          return p;
        }) as Whatsapp360DialogTemplateMessageComponentHeaderParameterType[],
      };
    }
    if (c.type === "body") {
      return {
        ...c,
        parameters: c.parameters.map((p) => {
          if (p.type === "text") {
            const { submitContent, checkParams } = replaceParamTokens(
              p.text,
              fieldNames,
              accuCheckParams.length
            );
            accuCheckParams = [...accuCheckParams, ...checkParams];
            return {
              type: "text",
              text: submitContent,
            };
          }
          return p;
        }) as Whatsapp360DialogTemplateMessageComponentTextParameterType[],
      };
    }
    if (c.type === "button") {
      return {
        ...c,
        parameters: c.parameters?.map((p) => {
          if (p.type === "text") {
            const { submitContent, checkParams } = replaceParamTokens(
              p.text,
              fieldNames,
              accuCheckParams.length
            );
            accuCheckParams = [...accuCheckParams, ...checkParams];
            return {
              type: "text",
              text: submitContent,
            };
          }
          return p;
        }) as Whatsapp360DialogTemplateMessageComponentTextParameterType[],
      };
    }
    return c;
  });
  return {
    components: updatedComponents.length > 0 ? updatedComponents : undefined,
    checkParams: accuCheckParams,
  };
}

export function formatWhatsApp360DialogMessage(
  channel: string,
  sendWhatsAppTemplate: SendWhatsappTemplateState,
  templateName: string,
  templateLanguage: string,
  components?: Array<TemplateMessageComponentType>
): WhatsApp360DialogExtendedCampaignMessageType {
  return {
    messageType: "template",
    whatsapp360DialogTemplateMessage: {
      templateName,
      language: templateLanguage,
      templateNamespace: sendWhatsAppTemplate.templateContent?.namespace!,
      components: components,
    },
  };
}

export function buildSaveCampaignRequest(
  campaignChannelMessages: ChannelMessageType[],
  fieldNames: string[],
  contactLists: number[] | undefined,
  name: string,
  channelsWithIds: TargetedChannelType[],
  automationActions: AutomationActionType[],
  company: CompanyType,
  scheduledAt: string | undefined,
  stripePaymentRequestOption?: PaymentLinkSetType
) {
  let conditions: AudienceFilterConditionType[] = [];
  if (contactLists) {
    const contactListIds = contactLists
      .map((id: any) => Number.parseInt(id))
      .filter((id) => !isNaN(id))
      .map(String);
    if (contactListIds.length) {
      conditions = [
        ...conditions,
        {
          conditionOperator: "Contains",
          fieldName: "importfrom",
          values: contactListIds,
          nextOperator: "And",
        },
      ];
      conditions = collapseListConditions(conditions);
    }
  }

  const targetedChannelWithIds = channelsWithIds.map(normalizeChannel);
  const toActionsNormalized = getNormalizeActionsReducer(
    false,
    automationActions,
    company
  );

  let param: BroadcastRequestType = {
    templateName: name,
    targetedChannelWithIds: targetedChannelWithIds,
    // @ts-ignore
    campaignChannelMessages: campaignChannelMessages.map(
      getMessageNormalizer(fieldNames)
    ),
    broadcastAsNote: targetedChannelWithIds.some((ch) => ch.channel === "note"),
    automationActions: automationActions.reduce(toActionsNormalized, []),
  };
  if (conditions.length > 0) {
    param = { ...param, conditions };
  }
  if (scheduledAt) {
    param = { ...param, scheduledAt };
  }
  if (stripePaymentRequestOption) {
    param = { ...param, stripePaymentRequestOption };
  }
  return param;
}

const normalizeChannel = (channel: TargetedChannelType) => {
  if (channel.channel === "twilio_whatsapp") {
    return {
      channel: "whatsapp" as ChannelType,
      ids: channel.ids,
    };
  }
  return channel;
};

const getMessageNormalizer =
  (fieldNames: string[]) => (message: ChannelMessageType) => {
    const isTwilioChannel = message.targetedChannelWithIds.some(
      (chnl) => chnl.channel === "twilio_whatsapp"
    );
    const is360DialogChannel = message.targetedChannelWithIds.some(
      (chnl) => chnl.channel === "whatsapp360dialog"
    );
    const isFbChannel = message.targetedChannelWithIds.some(
      (chnl) => chnl.channel === "facebook"
    );
    const isCloudApiChannel = message.targetedChannelWithIds.some(
      (chnl) => chnl.channel === "whatsappcloudapi"
    );
    let { submitContent, checkParams } = replaceParamTokens(
      message.content,
      fieldNames
    );
    let targetedChannelWithIds = isCloudApiChannel
      ? message.targetedChannelWithIds.map(normalizeChannel)
      : message.targetedChannelWithIds;

    const channelMessage = {
      id: message.id,
      targetedChannels: targetedChannelWithIds,
      templateContent: submitContent,
      templateParams: checkParams,
      uploadedFiles: [],
    };
    if (isTwilioChannel) {
      targetedChannelWithIds = message.targetedChannelWithIds.reduce(
        (acc: TargetedChannelType[], curr: TargetedChannelType) => {
          return [
            ...acc,
            {
              channel: "whatsapp" as ChannelType,
              ids: curr.ids,
            },
          ];
        },
        []
      );
      let content = message.content;
      if (message.templateName) {
        if (
          message.sendWhatsAppTemplate &&
          message.sendWhatsAppTemplate?.variables.content
        ) {
          const templateParams = message.sendWhatsAppTemplate.variables.content;
          content = Object.entries(templateParams).reduce(
            (prev, [key, param]) => prev.replace(key, param),
            message.content
          );
          const updatedParams = replaceParamTokens(content, fieldNames);
          if (message.sendWhatsAppTemplate.templateContent?.isContentTemplate) {
            return {
              ...channelMessage,
              templateName: message.templateName,
              targetedChannels: targetedChannelWithIds,
              officialTemplateParams: Object.values(templateParams),
              templateContent: updatedParams.submitContent,
              templateParams: updatedParams.checkParams,
              extendedMessageType:
                ExtendedMessageType.WhatsappTwilioContentTemplateMessage,
              extendedMessagePayloadDetail: {
                whatsappTwilioContentApiObject: {
                  contentSid:
                    message.sendWhatsAppTemplate.templateContent.contentSid ??
                    "",
                },
              },
            };
          }
          return {
            ...channelMessage,
            templateName: message.templateName,
            targetedChannels: targetedChannelWithIds,
            officialTemplateParams: Object.values(templateParams),
            templateContent: updatedParams.submitContent,
            templateParams: updatedParams.checkParams,
          };
        }
        return {
          ...channelMessage,
          targetedChannels: targetedChannelWithIds,
          templateName: message.templateName,
          officialTemplateParams: message.officialTemplateParams,
        };
      } else {
        return {
          ...channelMessage,
          targetedChannels: targetedChannelWithIds,
        };
      }
    } else if (is360DialogChannel) {
      if (message.sendWhatsAppTemplate) {
        if (
          message.targetedChannelWithIds.some(
            (chnl) => chnl.channel === "whatsapp360dialog"
          ) &&
          message.sendWhatsAppTemplate.templateContent
        ) {
          const normalizedComponents = normalize360DialogComponents(
            message.sendWhatsAppTemplate.templateContent,
            message.sendWhatsAppTemplate
          );
          const { components, checkParams } =
            format360DialogOfficialTemplateParam(
              normalizedComponents ?? [],
              fieldNames
            );
          const whatsapp360dialogRequest = formatWhatsApp360DialogMessage(
            "whatsapp360dialog",
            message.sendWhatsAppTemplate,
            message.templateName ?? "",
            message.templateLanguage ?? "",
            components
          );
          return {
            ...channelMessage,
            whatsApp360DialogExtendedCampaignMessage: whatsapp360dialogRequest,
            templateParams: checkParams,
          };
        }
      }
    } else if (isFbChannel) {
      const tab = message.facebookOTN?.tab;
      const option = message.facebookOTN?.option;
      return {
        ...channelMessage,
        ...(tab === FacebookOTNBroadcastMapType.facebookOTN
          ? {
              facebookOTNTopicId: option,
              extendedMessageType: ExtendedMessageType.FacebookOTNText,
              extendedMessagePayloadDetail: {
                facebookMessagePayload: {
                  text: message.content,
                },
              },
            }
          : {
              messageTag: option,
            }),
      };
    } else if (isCloudApiChannel) {
      if (message.sendWhatsAppTemplate?.templateContent) {
        const normalizedComponents = normalize360DialogComponents(
          message.sendWhatsAppTemplate.templateContent,
          message.sendWhatsAppTemplate
        );
        const { components, checkParams } =
          format360DialogOfficialTemplateParam(
            normalizedComponents ?? [],
            fieldNames
          );
        const { whatsapp360DialogTemplateMessage } =
          formatWhatsApp360DialogMessage(
            "whatsappcloudapi",
            message.sendWhatsAppTemplate,
            message.templateName ?? "",
            message.templateLanguage ?? "",
            components
          );

        return {
          ...channelMessage,
          templateParams: checkParams,
          extendedMessageType:
            ExtendedMessageType.WhatsappCloudApiTemplateMessage,
          extendedMessagePayloadDetail: {
            whatsappCloudApiTemplateMessageObject:
              whatsapp360DialogTemplateMessage,
          },
        };
      }
    }
    return {
      ...channelMessage,
    };
  };

export const isNotUserGroupCondition = (item: AudienceFilterConditionType) =>
  (item as FilterConditionCommonType).fieldName?.toLowerCase() !== "importfrom";

export const isUserGroupCondition = (item: AudienceFilterConditionType) =>
  (item as FilterConditionCommonType).fieldName?.toLowerCase() === "importfrom";

function collapseListConditions(
  conditions: AudienceFilterConditionType[]
): AudienceFilterConditionType[] {
  const listIds = extractContactListIdsFrom(conditions);
  const nonListConditions = conditions.filter(isNotUserGroupCondition);
  nonListConditions.push({
    fieldName: "importfrom",
    values: listIds.map((id) => id.toString()),
    nextOperator: "And",
    conditionOperator: "Contains",
  });

  return nonListConditions;
}
