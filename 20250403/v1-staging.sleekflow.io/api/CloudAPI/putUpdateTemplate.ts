import { putMethodWithExceptions } from "../apiRequest";
import { TemplateComponentType } from "features/WhatsappCloudAPI/models/WhatsappCloudAPITemplateType";

export async function putUpdateTemplate(
  wabaId: string,
  templateId: string,
  components: TemplateComponentType[]
) {
  return putMethodWithExceptions("/company/whatsapp/cloudapi/template", {
    param: {
      wabaId,
      templateId,
      templateComponents: components,
    },
  });
}
