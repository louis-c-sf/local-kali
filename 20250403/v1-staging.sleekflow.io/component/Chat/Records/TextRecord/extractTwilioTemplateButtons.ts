import { WhatsappTwilioContentTemplateMessageType } from "core/models/Message/WhatsappCloudAPIMessageType";
import { WhatsappTemplateComponentButtonType } from "types/WhatsappTemplateResponseType";

const TYPES_MAP = {
  "twilio/quick-reply": "quick_reply",
  "twilio/call-to-action": "call_to_action",
  "twilio/text": "text",
};

export function extractTwilioTemplateButtons(
  template: WhatsappTwilioContentTemplateMessageType["twilioContentObject"]
): WhatsappTemplateComponentButtonType[] {
  return Object.entries(template?.types ?? {}).reduce<
    WhatsappTemplateComponentButtonType[]
  >((acc, [key, value]) => {
    const type = TYPES_MAP[key];
    if (!type || !value) {
      return acc;
    }
    if (!value.actions) {
      return acc;
    }
    return [
      ...acc,
      ...value.actions.map((a) => ({
        type,
        text: a.title,
      })),
    ];
  }, []);
}
