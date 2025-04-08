import { post } from "../../../../api/apiRequest";
import { FilterGroupType, EntityType } from "./contracts";

export async function fetchObjectsCount(
  type: EntityType,
  filters: FilterGroupType[]
): Promise<{ count: number }> {
  return await post("/CrmHub/GetObjectsCount", {
    param: {
      entity_type_name: type,
      provider_name: "salesforce-integrator",
      filter_groups: filters,
    },
  });
}
