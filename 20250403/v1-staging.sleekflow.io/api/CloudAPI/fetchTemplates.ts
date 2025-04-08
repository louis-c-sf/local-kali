import { getWithExceptions } from "api/apiRequest";
import { WhatsappCloudAPITemplateType } from "features/WhatsappCloudAPI/models/WhatsappCloudAPITemplateType";

export function fetchTemplates(
  wabaId: string,
  allowCache: boolean
): Promise<{ whatsappTemplates: WhatsappCloudAPITemplateType[] }> {
  return getWithExceptions("/company/whatsapp/cloudapi/template", {
    param: {
      wabaId,
      allowCache,
    },
  });
}
