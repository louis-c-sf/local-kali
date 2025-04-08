import { UserProfileGroupType } from "../../container/Contact/Imported/UserProfileGroupType";
import { get } from "../apiRequest";
import { GET_USER_PROFILES_LIST } from "../apiPath";

interface UserGroupsResponse {
  userGroups: UserProfileGroupType[];
}

export async function fetchUserGroups(): Promise<UserGroupsResponse> {
  return await get(GET_USER_PROFILES_LIST, {
    param: {
      limit: 500,
      offset: 0,
    },
  });
}
