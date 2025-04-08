import { post } from "../../../../api/apiRequest";
import {
  EntityType,
  ResponseType,
  ObjectNormalizedExpandedType,
} from "./contracts";

export async function fetchGetObjectsByIdentities(
  type: EntityType,
  phoneNumber: string,
  providerName?: string
): Promise<ResponseType<ObjectNormalizedExpandedType<string>>> {
  return await post("/CrmHub/GetObjectsByIdentities", {
    param: {
      provider_name: providerName ?? null,
      entity_type_name: type,
      identities: [
        {
          phone_number: phoneNumber,
          email: null,
          provider_object_id: null,
          object_id: null,
        },
      ],
      sorts: [],
    },
  });
}
