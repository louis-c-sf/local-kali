import { post } from "../apiRequest";
import { WhatsappTemplateCallbackType } from "../../features/Whatsapp360/API/fetchCallbackTemplates";

export type CallbackTemplatePayloadType = {
  templateName: string;
  templateNamespace: string;
  callbackActions: Array<{
    quickReplyButtonIndex: number;
    webhookUrl: string;
    type: string;
  }>;
};

export async function submitCallbackTemplate(
  template: CallbackTemplatePayloadType
): Promise<WhatsappTemplateCallbackType> {
  return await post("/company/whatsapp/template/callback", { param: template });
}
