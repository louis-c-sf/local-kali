import { getWithExceptions } from "api/apiRequest";
import { CloudAPIAutoTopUpOptionsType } from "features/WhatsappCloudAPI/models/WhatsappCloudAPIAutoTopUp";

export async function fetchAutoTopUpOptions(): Promise<CloudAPIAutoTopUpOptionsType> {
  return await getWithExceptions(
    "/company/whatsapp/cloudapi/auto-top-up/settings",
    {
      param: {},
    }
  );
}
