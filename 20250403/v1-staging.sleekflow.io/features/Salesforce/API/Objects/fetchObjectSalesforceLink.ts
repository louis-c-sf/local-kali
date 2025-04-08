import { post } from "../../../../api/apiRequest";
import { EntityType } from "./contracts";

export async function fetchObjectSalesforceLink(
  type: EntityType,
  id: string
): Promise<{ object_direct_ref_url: string }> {
  return await post("/CrmHub/GetProviderObjectDirectRefUrl", {
    param: {
      entity_type_name: type,
      provider_name: "salesforce-integrator",
      object_id: id,
    },
  });
}
