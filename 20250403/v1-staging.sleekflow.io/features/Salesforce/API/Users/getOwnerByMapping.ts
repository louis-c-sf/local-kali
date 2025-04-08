import {
  CrmHubUserNormalized,
  CrmHubUserMappingType,
} from "./fetchUserMappings";
import { ObjectNormalizedType } from "../Objects/contracts";

export function getOwnerByMapping(
  object: ObjectNormalizedType,
  vendor: "salesforce",
  mappings: CrmHubUserMappingType
): CrmHubUserNormalized | undefined {
  let strategy: SalesforceSearchStrategy | null = null;
  if (vendor === "salesforce") {
    strategy = new SalesforceSearchStrategy(mappings);
  }
  if (!strategy) {
    throw `Missing vendor support: ${vendor}`;
  }
  const objectOwnerId = strategy.getObjectOwnerId(object);
  if (!objectOwnerId) {
    return;
  }
  const ownerId = strategy.getCrmHubOwnerId(objectOwnerId);
  if (!ownerId) {
    return;
  }
  return mappings.crm_hub_user_id_to_staff_dict[ownerId];
}

interface SearchStrategyInterface {
  getObjectOwnerId(object: ObjectNormalizedType): string | undefined;

  getCrmHubOwnerId(vendorId: string): string | undefined;
}

class SalesforceSearchStrategy implements SearchStrategyInterface {
  constructor(private mapping: CrmHubUserMappingType) {}

  getObjectOwnerId(object: ObjectNormalizedType) {
    return object["salesforce-integrator:OwnerId"] ?? undefined;
  }

  getCrmHubOwnerId(vendorId: string) {
    return this.mapping.provider_id_to_crm_hub_user_mappings_dict[
      `salesforce-integrator:${vendorId}`
    ]?.main_crm_hub_user_id;
  }
}
