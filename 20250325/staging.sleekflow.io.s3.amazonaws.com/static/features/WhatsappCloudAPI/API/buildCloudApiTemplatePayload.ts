import {
  ExtendedMessagePayloadType,
  TemplateMessageComponentType,
} from "types/MessageType";
import { CloudAPITemplateFormValue } from "component/Settings/SettingTemplates/CloudApi/EditTemplate";
import { buildHeader } from "features/WhatsappCloudAPI/API/buildCloudApiTemplatePayload/buildHeader";
import { buildBody } from "features/WhatsappCloudAPI/API/buildCloudApiTemplatePayload/buildBody";
import { buildButtons } from "features/WhatsappCloudAPI/API/buildCloudApiTemplatePayload/buildButtons";

export function buildCloudApiTemplatePayload(
  id: string,
  name: string,
  language: string,
  form: CloudAPITemplateFormValue
): ExtendedMessagePayloadType {
  const steps = [
    () => {
      const header = buildHeader(form);
      return header ? [header] : [];
    },
    () => {
      const body = buildBody(form);
      return body ? [body] : [];
    },
    () => buildButtons(form),
  ];

  return {
    channel: "whatsappcloudapi",
    id,
    extendedMessageType: 101,
    extendedMessagePayloadDetail: {
      whatsappCloudApiTemplateMessageObject: {
        language,
        templateName: name,
        components: steps.reduce<TemplateMessageComponentType[]>(
          (acc, next) => [...acc, ...next()],
          []
        ),
      },
    },
  };
}
