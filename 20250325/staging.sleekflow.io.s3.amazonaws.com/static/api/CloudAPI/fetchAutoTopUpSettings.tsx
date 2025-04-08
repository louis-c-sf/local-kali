import { getWithExceptions } from "api/apiRequest";
import { CloudAPIAutoTopUpSettingsType } from "features/WhatsappCloudAPI/models/WhatsappCloudAPIAutoTopUp";

type SettingsResponseType = {
  business_balance_auto_top_up_profile: CloudAPIAutoTopUpSettingsType;
};

export async function fetchAutoTopUpSettings(
  facebookBusinessId: string
): Promise<SettingsResponseType> {
  return await getWithExceptions(
    `/company/whatsapp/cloudapi/auto-top-up/${facebookBusinessId}`,
    {
      param: {},
    }
  );
}
