import { ProfileType } from "../../../types/LoginType";
import { prop, uniqBy } from "ramda";

export function dedupeChats(chats: ProfileType[]) {
  return uniqBy(prop("id"), chats);
}
