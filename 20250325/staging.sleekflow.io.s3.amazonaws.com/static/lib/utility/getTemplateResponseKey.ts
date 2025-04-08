import { WhatsappChannelType } from "component/Chat/Messenger/types";

export function getTemplateResponseKey({
  templateName,
  language,
  channel,
  sid,
}: {
  templateName: string;
  channel: WhatsappChannelType;
  language?: string;
  sid?: string;
}) {
  switch (channel) {
    case "whatsappcloudapi":
      return `${templateName}_${language}`;
    case "whatsapp360dialog":
      return templateName;
    default:
      return sid ? `content_${templateName}_${sid}` : templateName;
  }
}
export function extractTemplateName({
  templateName,
  language,
  channel,
}: {
  templateName: string;
  channel: WhatsappChannelType;
  language?: string;
}) {
  const matchTemplateNameWithLangReg = new RegExp(`.+_${language}`);
  switch (channel) {
    case "whatsappcloudapi":
      return language && matchTemplateNameWithLangReg.test(templateName)
        ? templateName.substring(
            0,
            templateName.length - (language?.length ?? 0) - 1
          )
        : templateName;
    case "whatsapp360dialog":
      return templateName;
    default:
      return templateName;
  }
}
