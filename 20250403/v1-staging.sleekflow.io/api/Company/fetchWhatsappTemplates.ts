import { GET_TWILIO_TEMPLATES } from "../apiPath";
import { getWithExceptions } from "../apiRequest";
import { WhatsappTemplateResponseType } from "../../types/WhatsappTemplateResponseType";

export default function fetchWhatsappTemplates(
  page: number,
  pageSize: number,
  accountSID: string
): Promise<WhatsappTemplateResponseType> {
  return getWithExceptions(GET_TWILIO_TEMPLATES, {
    param: {
      page,
      accountSID,
      pageSize,
    },
  });
}
