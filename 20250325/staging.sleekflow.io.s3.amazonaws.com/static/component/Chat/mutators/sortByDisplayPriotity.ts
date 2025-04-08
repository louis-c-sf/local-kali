import { ProfileType } from "../../../types/LoginType";
import { partition, sortWith } from "ramda";
import { bookmarkedFirst, byCustomOrderBy } from "./chatSelectors";
import { DefaultOrderBy, InboxOrderDictEnum } from "types/state/InboxStateType";

//UPD: sort by customized order by instead of create date
export function sortByDisplayPriority(
  chats: ProfileType[],
  inboxOrderBy?: InboxOrderDictEnum
) {
  const [empties, nonEmpties] = partition((chat) => {
    if (!chat.conversation) return true;
    return chat.conversation.list.length === 0;
  }, chats);

  return sortWith(
    [bookmarkedFirst, byCustomOrderBy(inboxOrderBy ?? DefaultOrderBy)],
    [...nonEmpties, ...empties]
  );
}
