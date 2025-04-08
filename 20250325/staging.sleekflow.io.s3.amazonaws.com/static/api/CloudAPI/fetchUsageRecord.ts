import { getWithExceptions } from "api/apiRequest";
import { WhatsappCloudApiUsageRecordType } from "types/CompanyType";

export async function fetchUsageRecord(): Promise<
  WhatsappCloudApiUsageRecordType[]
> {
  return await getWithExceptions("/company/whatsapp/cloudapi/balances", {
    param: {},
  });
}
