import { postWithExceptions } from "../../../../api/apiRequest";
import { EntityType } from "./contracts";

export async function fetchObjectFieldUnifiedChoices(
  entity: EntityType,
  fieldName: string
): Promise<ResponseType> {
  return await postWithExceptions("/CrmHub/GetTypeFieldValues", {
    param: {
      entity_type_name: entity,
      field_name: fieldName,
    },
  });
}

interface ResponseType {
  values: string[];
}
