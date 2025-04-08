import { post } from "api/apiRequest";
import {
  camelize,
  snakelize,
  CaseConverterParamsType,
} from "lib/utility/caseConverter";
import { ProviderType } from "./contracts";

type GetObjectsCountType = {
  count: number;
};
type ConditionType = {
  fieldName: string;
  operator?: string;
  value: string;
};
export default async function postGetProviderObjectsCount(
  providerName: ProviderType,
  entityTypeName: string,
  filters: ConditionType[]
): Promise<GetObjectsCountType> {
  return await post("/CrmHub/GetProviderObjectsCount", {
    param: {
      provider_name: providerName,
      entity_type_name: entityTypeName,
      filters: snakelize(filters as unknown as CaseConverterParamsType),
    },
  }).then((response) => camelize(response) as GetObjectsCountType);
}

export async function postGetProviderContactCount(
  providerName: ProviderType,
  filters: ConditionType[]
): Promise<GetObjectsCountType> {
  return await postGetProviderObjectsCount(providerName, "Contact", filters);
}
