import { post } from "api/apiRequest";
import { camelize } from "lib/utility/caseConverter";

type GetSyncObjectsProgressType = {
  count: number;
  last_update_time: string;
  status: string;
};

export default async function postGetSyncObjectsProgress(
  providerName: string,
  providerStateId: string
): Promise<GetSyncObjectsProgressType> {
  const response = await post("/CrmHub/GetProviderSyncObjectsProgress", {
    param: { provider_name: providerName, provider_state_id: providerStateId },
  });
  return camelize(response) as GetSyncObjectsProgressType;
}
