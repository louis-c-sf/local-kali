import { get } from "../apiRequest";
import { GET_USER_PROFILES_LIST } from "../apiPath";
import { UserProfileGroupType } from "../../container/Contact/Imported/UserProfileGroupType";

export async function fetchListsPage(
  pageSize: number,
  offset: number,
  search?: string
): Promise<{
  userGroups: UserProfileGroupType[];
  totalGroups: number;
}> {
  const param: any = {
    limit: pageSize,
    offset: offset,
  };
  if (search) {
    param.name = search;
  }
  return await get(GET_USER_PROFILES_LIST, { param });
}
