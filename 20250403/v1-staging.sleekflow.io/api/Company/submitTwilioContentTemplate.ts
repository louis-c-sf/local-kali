import { postWithExceptions } from "../apiRequest";
import { WhatsappContentTemplateCreateType } from "types/WhatsappTemplateResponseType";

export async function submitTwilioContentTemplate(
  accountSid: string,
  templateContent: WhatsappContentTemplateCreateType
) {
  return await postWithExceptions(
    `/twilio/whatsapp/template/content?accountSID=${accountSid}`,
    {
      param: templateContent,
    }
  );
}
