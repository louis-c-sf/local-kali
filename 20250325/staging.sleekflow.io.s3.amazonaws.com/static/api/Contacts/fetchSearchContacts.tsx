import { AudienceFilterConditionType } from "../../types/BroadcastCampaignType";
import { post, buildParamString } from "../apiRequest";
import { POST_USER_PROFILE_SEARCH } from "../apiPath";
import { SearchContactResultType } from "../../types/ProfileSearchType";

export async function fetchSearchContacts(
  query: object,
  allFilters: AudienceFilterConditionType[]
): Promise<SearchContactResultType> {
  return await post(
    `${POST_USER_PROFILE_SEARCH}?${buildParamString(
      query as Record<string, string>
    )}`,
    { param: allFilters }
  );
}
