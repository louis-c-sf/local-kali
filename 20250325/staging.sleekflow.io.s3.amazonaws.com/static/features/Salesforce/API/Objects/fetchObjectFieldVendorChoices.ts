import { post, postWithExceptions } from "../../../../api/apiRequest";
import { EntityType } from "./contracts";

export async function fetchObjectFieldVendorChoices(
  type: EntityType
): Promise<ResponseType> {
  return await postWithExceptions("/CrmHub/GetProviderTypeFields", {
    param: {
      entity_type_name: type,
      provider_name: "salesforce-integrator",
    },
  });
}

export interface PicklistValueType {
  label: string;
  value: string;
}

export interface ChoiceFieldNormalizedType {
  calculated: boolean;
  label: string;
  name: string;
  type: "reference" | "picklist" | "string" | "null" | "date" | "datetime";
  compound_field_name?: string;
  picklist_values?: Array<PicklistValueType>;
}

interface ResponseType {
  fields: Array<ChoiceFieldNormalizedType>;
}
