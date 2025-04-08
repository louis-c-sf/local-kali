import { Whatsapp360DialogTemplatesResponse } from "../../types/WhatsappTemplateResponseType";
import { getWithExceptions } from "../apiRequest";

export default function fetch360DialogTemplate(
  whatsapp360DialogConfigId: number,
  limit: number = 1000,
  offset: number = 0
): Promise<Whatsapp360DialogTemplatesResponse> {
  return getWithExceptions(
    `/company/whatsapp/360dialog/${whatsapp360DialogConfigId}/template`,
    {
      param: {
        limit,
        offset,
      },
    }
  );
}
