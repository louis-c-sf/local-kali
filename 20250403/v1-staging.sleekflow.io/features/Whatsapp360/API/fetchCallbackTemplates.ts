import { getWithExceptions } from "../../../api/apiRequest";
import { WhatsappTemplateCallbackActionType } from "../../../types/WhatsappTemplateResponseType";

export type WhatsappTemplateCallbackType = {
  id: string;
  companyId: string;
  templateName: string;
  templateNamespace: string;
  callbackActions: WhatsappTemplateCallbackActionType[];
};

interface CallbacksResponseType {
  whatsappTemplateQuickReplyCallbacks: Array<WhatsappTemplateCallbackType>;
}

export async function fetchCallbackTemplates(): Promise<CallbacksResponseType> {
  return await getWithExceptions("/company/whatsapp/template/callback", {
    param: {},
  });
}
