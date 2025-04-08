import { getWithExceptions } from "../apiRequest";
import { WhatsappContentTemplateResponseType } from "../../types/WhatsappTemplateResponseType";

export default function fetchTwilioContentTemplate(
  page: number,
  pageSize: number,
  accountSID: string
): Promise<WhatsappContentTemplateResponseType> {
  return getWithExceptions("/twilio/whatsapp/template/content", {
    param: {
      page,
      accountSID,
      pageSize,
    },
  });
}
