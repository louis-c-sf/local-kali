import { get } from "../apiRequest";
import { GET_USERPROFILE } from "../apiPath";

export function fetchAllContacts(query: {
  limit: string;
  offset: string;
  sortby?: string;
  order?: "asc" | "desc";
}) {
  return get(GET_USERPROFILE, { param: query });
}
