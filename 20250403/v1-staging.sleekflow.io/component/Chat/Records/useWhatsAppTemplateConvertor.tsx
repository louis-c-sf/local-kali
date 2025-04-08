import { useAppSelector } from "AppRootContext";
import {
  WhatsappCloudAPITemplateMessageType,
  WhatsappTwilioContentTemplateMessageType,
} from "core/models/Message/WhatsappCloudAPIMessageType";
import MessageType, {
  Whatsapp360DialogTemplateMessageComponentDocumentParameterType,
  Whatsapp360DialogTemplateMessageComponentImageParameterType,
  Whatsapp360DialogTemplateMessageComponentTextParameterType,
  Whatsapp360DialogTemplateMessageComponentVideoParameterType,
  Whatsapp360DialogTemplateMessageType,
} from "types/MessageType";
import { HeaderFormatEnum } from "types/WhatsappTemplateResponseType";
import { TemplateContentType } from "./TextRecord";
import { getMatchedVariables } from "lib/utility/getMatchedVariables";
import { getTemplateResponseKey } from "lib/utility/getTemplateResponseKey";
import { WhatsappChannelType } from "../Messenger/types";
import { NormalizedWhatsAppTemplateType } from "features/Whatsapp360/models/OptInType";
import { extractTwilioTemplateButtons } from "component/Chat/Records/TextRecord/extractTwilioTemplateButtons";

export default function useWhatsAppTemplateConvertor(message: MessageType) {
  const whatsapp360Templates = useAppSelector(
    (s) => s.inbox.whatsAppTemplates.whatsapp360Templates
  );
  const cloudAPITemplates = useAppSelector(
    (s) => s.inbox.whatsAppTemplates.whatsappCloudApiTemplates
  );
  const cloudAPIId = useAppSelector(
    (s) =>
      s.company?.whatsappCloudApiConfigs?.find(
        (c) => c.whatsappPhoneNumber === s.selectedChannelIdFromConversation
      )?.id
  );

  function getNormalizedWhatsAppTemplateType():
    | NormalizedWhatsAppTemplateType
    | undefined {
    if (message.channel === "whatsappcloudapi") {
      return cloudAPITemplates.find((c) => c.channelId === cloudAPIId)?.data;
    }
    if (message.channel === "whatsapp360dialog") {
      return whatsapp360Templates.booted
        ? whatsapp360Templates.data
        : undefined;
    }
    return undefined;
  }

  function getCloudApiDialogTemplate(
    message: MessageType
  ): WhatsappCloudAPITemplateMessageType | undefined {
    return message.extendedMessagePayload?.extendedMessagePayloadDetail
      ?.whatsappCloudApiTemplateMessageObject;
  }

  function getTwilioTemplate(
    message: MessageType
  ): WhatsappTwilioContentTemplateMessageType["twilioContentObject"] {
    return message.extendedMessagePayload?.extendedMessagePayloadDetail
      ?.whatsappTwilioContentApiObject?.twilioContentObject;
  }

  function get360DialogTemplate(
    message: MessageType
  ): Whatsapp360DialogTemplateMessageType | undefined {
    return message.whatsapp360DialogExtendedMessagePayload
      ?.whatsapp360DialogTemplateMessage;
  }

  function whatsappTemplateMessageConverter():
    | undefined
    | string
    | TemplateContentType {
    const is360Dialog = "whatsapp360dialog" === message.channel;
    const isCloudApi = "whatsappcloudapi" === message.channel;
    const isTwilio = message.channelName === "whatsapp_twilio";
    if (!(isCloudApi || is360Dialog || isTwilio)) {
      return message.messageContent;
    }

    const templateNormalized = getNormalizedWhatsAppTemplateType();
    let usedTemplateMessage:
      | Whatsapp360DialogTemplateMessageType
      | WhatsappCloudAPITemplateMessageType
      | undefined = undefined;
    if (isCloudApi) {
      usedTemplateMessage = getCloudApiDialogTemplate(message);
    } else if (is360Dialog) {
      usedTemplateMessage = get360DialogTemplate(message);
    } else if (isTwilio) {
      const template = getTwilioTemplate(message);
      return {
        content: message.messageContent,
        buttons: template ? extractTwilioTemplateButtons(template) : undefined,
      };
    }
    if (!usedTemplateMessage || !templateNormalized) {
      return {
        content: message.messageContent,
      };
    }
    const key = getTemplateResponseKey({
      language: usedTemplateMessage.language,
      templateName: usedTemplateMessage.templateName,
      channel: message.channel as WhatsappChannelType,
    });
    const selectedTemplateLanguage =
      templateNormalized[key]?.translations[usedTemplateMessage.language];
    let contentTemplate: TemplateContentType = {
      content: selectedTemplateLanguage?.content ?? message.messageContent,
    };
    const headerComponent = usedTemplateMessage?.components?.find(
      (c) => c?.type.toLowerCase() === "header"
    );
    const bodyComponent = usedTemplateMessage?.components?.find(
      (c) => c?.type.toLowerCase() === "body"
    );
    if (bodyComponent) {
      const bodyParameters =
        bodyComponent.parameters as Array<Whatsapp360DialogTemplateMessageComponentTextParameterType>;
      if (selectedTemplateLanguage) {
        contentTemplate = {
          ...contentTemplate,
          content: getMatchedVariables(
            selectedTemplateLanguage?.content
          ).reduce((str, next, currIndex) => {
            if (next.index !== undefined && bodyParameters[currIndex]) {
              return str.replace(next[0], bodyParameters[currIndex].text);
            }
            return str;
          }, selectedTemplateLanguage?.content),
        };
      }
    }

    if (selectedTemplateLanguage?.header) {
      let headerContent = "";
      let fileName = "";
      if (
        selectedTemplateLanguage.header.format === HeaderFormatEnum.TEXT &&
        selectedTemplateLanguage.header.text
      ) {
        if (headerComponent) {
          const headerParameters =
            headerComponent?.parameters as Array<Whatsapp360DialogTemplateMessageComponentTextParameterType>;
          headerContent = getMatchedVariables(
            selectedTemplateLanguage.header.text
          ).reduce((str, next, currIndex) => {
            if (next[0]) {
              return str.replace(next[0], headerParameters[currIndex].text);
            }
            return str;
          }, selectedTemplateLanguage.header.text);
        } else {
          headerContent = selectedTemplateLanguage.header.text;
        }
      } else if (
        selectedTemplateLanguage.header.format === HeaderFormatEnum.DOCUMENT
      ) {
        const [documnet] = (headerComponent?.parameters ??
          []) as Array<Whatsapp360DialogTemplateMessageComponentDocumentParameterType>;
        headerContent = documnet?.document?.link ?? "";
        fileName = documnet?.document?.filename ?? "";
      } else if (
        selectedTemplateLanguage.header.format === HeaderFormatEnum.VIDEO
      ) {
        const [video] = (headerComponent?.parameters ??
          []) as Array<Whatsapp360DialogTemplateMessageComponentVideoParameterType>;
        headerContent = video?.video?.link;
      } else if (
        selectedTemplateLanguage.header.format === HeaderFormatEnum.IMAGE
      ) {
        const [image] = (headerComponent?.parameters ??
          []) as Array<Whatsapp360DialogTemplateMessageComponentImageParameterType>;
        headerContent = image?.image?.link ?? "";
      }
      contentTemplate = {
        ...contentTemplate,
        header: {
          filename: fileName,
          format: selectedTemplateLanguage.header.format,
          content: headerContent,
        },
      };
    }
    if (selectedTemplateLanguage?.footer) {
      contentTemplate = {
        ...contentTemplate,
        footer: selectedTemplateLanguage.footer.text,
      };
    }
    const buttons = selectedTemplateLanguage?.buttons ?? [];
    return { ...contentTemplate, buttons };
  }

  return {
    content: whatsappTemplateMessageConverter(),
  };
}
