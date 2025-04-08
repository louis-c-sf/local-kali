import { post } from "../../../../api/apiRequest";
import { EntityType } from "./contracts";

export async function fetchObjectConversation(
  type: EntityType,
  id: string
): Promise<ResponseType> {
  return await post("/CrmHub/GetConversationByObject", {
    param: {
      entity_type_name: type,
      object_id: id,
    },
  });
}

type ResponseType = {
  conversation_id: string;
};
