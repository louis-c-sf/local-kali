import { post } from "api/apiRequest";

export default async function postUpdateUserMapping(userMapping: {
  [key: string]: string;
}): Promise<void> {
  return await post("/CrmHub/UpdateUserMappings", {
    param: {
      crm_hub_user_object_id_to_user_id_dict: userMapping,
    },
  });
}
