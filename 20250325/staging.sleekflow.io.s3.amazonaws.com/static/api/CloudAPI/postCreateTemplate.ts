import { postWithExceptions } from "../apiRequest";
import { TemplateContentType } from "features/WhatsappCloudAPI/models/WhatsappCloudAPITemplateType";

export async function postCreateTemplate(
  wabaId: string,
  template: TemplateContentType
) {
  return postWithExceptions("/company/whatsapp/cloudapi/template", {
    param: {
      wabaId,
      createTemplateObject: template,
    },
  });
}
