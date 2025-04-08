import { deleteMethod } from "api/apiRequest";

export async function submitDeleteTemplate(
  wabaId: string,
  templateName: string
) {
  return await deleteMethod("/company/whatsapp/cloudapi/template", {
    param: {
      wabaId,
      templateName,
    },
  });
}
