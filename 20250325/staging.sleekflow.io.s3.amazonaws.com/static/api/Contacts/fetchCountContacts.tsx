import { post } from "../apiRequest";
import { POST_USER_PROFILE_COUNT } from "../apiPath";
import { AudienceFilterConditionType } from "../../types/BroadcastCampaignType";
import { CountContactsResultType } from "../../types/ProfileSearchType";

export async function fetchCountContacts(
  filters: AudienceFilterConditionType[]
): Promise<CountContactsResultType> {
  return await post(POST_USER_PROFILE_COUNT, { param: filters });
}
