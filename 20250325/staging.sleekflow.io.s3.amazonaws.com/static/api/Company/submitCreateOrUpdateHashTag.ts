import {
  HashTagType,
  normalizeHashTag,
  HashTagCountedType,
} from "../../types/ConversationType";
import { postWithExceptions } from "../apiRequest";
import { POST_COMPANY_TAGS } from "../apiPath";

export async function submitCreateOrUpdateHashTag(
  tag: HashTagType | HashTagType[]
): Promise<HashTagCountedType[]> {
  return await postWithExceptions(POST_COMPANY_TAGS, {
    param: Array.isArray(tag)
      ? tag.map((item) => normalizeHashTag(item))
      : [normalizeHashTag(tag)],
  });
}
