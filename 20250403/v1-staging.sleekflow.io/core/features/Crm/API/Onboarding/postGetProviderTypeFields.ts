import { post } from "api/apiRequest";
import { camelize } from "lib/utility/caseConverter";
import { ProviderFieldsType } from "./contracts";

type ProviderTypeFieldResponse = {
  fields: ProviderFieldsType[];
  mappedFieldNames: string[];
  unmappedFieldNames: string[];
};

export default async function postGetProviderTypeFields(
  providerName: string,
  entityTypeName: string
): Promise<ProviderTypeFieldResponse> {
  const response = await post("/CrmHub/GetProviderTypeFields", {
    param: { provider_name: providerName, entity_type_name: entityTypeName },
  });
  return camelize(response) as ProviderTypeFieldResponse;
}

export async function postGetProviderTypeContact(
  providerName: string
): Promise<ProviderTypeFieldResponse> {
  return await postGetProviderTypeFields(providerName, "Contact");
}
