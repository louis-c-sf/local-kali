import { UserProfileGroupType } from "../../container/Contact/Imported/UserProfileGroupType";
import { post } from "../apiRequest";
import { CREATE_USER_PROFILE_GROUP } from "../apiPath";

export async function submitCreateList(
  name: string,
  userIds: string[]
): Promise<UserProfileGroupType> {
  return await post(CREATE_USER_PROFILE_GROUP, {
    param: {
      GroupListName: name,
      UserProfileIds: userIds,
    },
  });
}
