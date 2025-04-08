import { post } from "api/apiRequest";
import { camelize } from "lib/utility/caseConverter";

type TriggerProviderSyncObjectsType = {
  count: number;
  providerStateId: string;
};

export default async function postTriggerProviderSyncObjects(
  providerName: string,
  entityTypeName: string
): Promise<TriggerProviderSyncObjectsType> {
  const response = await post("/CrmHub/TriggerProviderSyncObjects", {
    param: { provider_name: providerName, entity_type_name: entityTypeName },
  });
  return camelize(response) as TriggerProviderSyncObjectsType;
}
