import { getDefaultVariableValues } from "../../../Chat/Messenger/SelectWhatsappTemplate/getDefaultVariableValues";
import {
  ChannelMessageType,
  TargetedChannelType,
} from "../../../../types/BroadcastCampaignType";
import {
  TemplateVariableState,
  GenericSendWhatsappTemplate,
} from "../../../../App/reducers/Chat/whatsappTemplatesReducer";
import { OptInContentType } from "../../../../features/Whatsapp360/models/OptInType";
import { isAnyWhatsappChannel } from "core/models/Channel/isAnyWhatsappChannel";

export function updateWhatsapp360MessageTemplate(
  message: ChannelMessageType,
  template: OptInContentType,
  action: {
    language: string;
    variables?: TemplateVariableState | undefined;
    templateName: string | undefined;
    file?: GenericSendWhatsappTemplate["file"];
  }
): ChannelMessageType {
  return {
    ...message,
    templateLanguage: action.language,
    content: template.content,
    sendWhatsAppTemplate: {
      templateContent: template,
      variables: action.variables
        ? action.variables
        : getDefaultVariableValues(template),
      file: action.file,
    },
    mode: "template",
    templateName: action.templateName,
    isSelectedTemplate: true,
  };
}
export const defaultVariables = { header: {}, content: {}, button: {} };
export function createBlankWhatsappChannelMessage(
  channel: TargetedChannelType
): ChannelMessageType {
  const channelDependentFields = isAnyWhatsappChannel(channel.channel)
    ? { mode: "template", isSelectedTemplate: false }
    : {};

  return {
    content: "",
    uploadedFiles: [],
    params: [],
    ...channelDependentFields,
    targetedChannelWithIds: [
      {
        channel: channel.channel,
        ids: channel.ids,
      },
    ],
    sendWhatsAppTemplate: {
      templateContent: undefined,
      variables: { ...defaultVariables },
    },
  };
}
