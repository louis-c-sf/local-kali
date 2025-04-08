import { useCallback } from "react";
import { postWithExceptions } from "../../../api/apiRequest";
import { POST_UPDATE_USER_PROFILE_REMOVE_FROM_GROUP } from "../../../api/apiPath";

export function useRemoveContactsFromList() {
  const remove = useCallback(async (profileIds: string[], listId: string) => {
    return await postWithExceptions(
      POST_UPDATE_USER_PROFILE_REMOVE_FROM_GROUP.replace("{id}", listId),
      { param: { UserProfileIds: profileIds } }
    );
  }, []);

  return { remove };
}
