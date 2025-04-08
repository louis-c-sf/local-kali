import { deleteMethodWithExceptions } from "api/apiRequest";

export async function sendDeleteTwilioOldTemplate(
  id: string,
  accountSID: string
): Promise<void> {
  return await deleteMethodWithExceptions(
    `/twilio/whatsapp/template/${id}/?accountSID=${accountSID}`,
    { param: {} }
  );
}
