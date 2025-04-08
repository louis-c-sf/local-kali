import { post } from "../apiRequest";
import { POST_USER_PROFILE_SELECT_ALL } from "../apiPath";
import { AudienceFilterConditionType } from "../../types/BroadcastCampaignType";
import { SelectAllContactResultType } from "../../types/ProfileSearchType";

export async function fetchSelectAll(
  filters: AudienceFilterConditionType[]
): Promise<SelectAllContactResultType> {
  return await post(POST_USER_PROFILE_SELECT_ALL, { param: filters });
}
