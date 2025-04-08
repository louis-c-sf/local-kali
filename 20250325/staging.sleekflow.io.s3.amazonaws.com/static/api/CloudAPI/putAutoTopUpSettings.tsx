import { putMethodWithExceptions } from "../apiRequest";
import { CloudAPIAutoTopUpSettingsType } from "features/WhatsappCloudAPI/models/WhatsappCloudAPIAutoTopUp";

export async function putUpdateAutoTopSettings(
  settings: CloudAPIAutoTopUpSettingsType,
  redirectToUrl: string,
  phoneNumber?: string
): Promise<boolean> {
  const { payment_url } = await putMethodWithExceptions(
    "/company/whatsapp/cloudapi/auto-top-up",
    {
      param: {
        businessBalanceAutoTopUpProfile: settings,
        redirect_to_url: redirectToUrl,
        phone_number: phoneNumber,
      },
    }
  );

  if (payment_url) {
    window.location.href = payment_url;
  }

  return !!payment_url;
}
