import { post } from "../../../../api/apiRequest";
import { EntityType } from "./contracts";

export async function fetchObjectFieldTypes(
  type: EntityType
): Promise<ResponseType> {
  return await post("/CrmHub/GetTypeFields", {
    param: { entity_type_name: type },
  });
}

export type ScalarFieldNormalizedType = {
  name: string;
  label?: string;
  types: Array<"null" | "string" | "datetime" | "boolean" | "number">;
};
type ResponseType = {
  fields: ScalarFieldNormalizedType[];
};
