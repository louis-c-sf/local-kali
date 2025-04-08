import { deleteMethodWithExceptions } from "api/apiRequest";

export async function sendDeleteTwilioContentTemplate(
  templateId: string,
  accountSID: string
): Promise<void> {
  const path = `/twilio/whatsapp/template/content/${templateId}?AccountSID=${accountSID}`;
  return await deleteMethodWithExceptions(path, { param: {} });
}
