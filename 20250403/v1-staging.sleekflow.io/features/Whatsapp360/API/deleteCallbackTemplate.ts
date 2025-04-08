import { deleteMethod } from "../../../api/apiRequest";

export async function deleteCallbackTemplate(id: string, namespace: string) {
  return await deleteMethod("/company/whatsapp/template/callback", {
    param: {
      templateName: id,
      templateNamespace: namespace,
    },
  });
}
