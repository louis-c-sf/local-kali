import { getWithExceptions } from "../apiRequest";
import { GET_COMPANY_TAGS } from "../apiPath";

export async function fetchCompanyTags(hashTagType?: number) {
  const param = hashTagType ? { hashTagType } : {};
  return await getWithExceptions(GET_COMPANY_TAGS, { param: { ...param } });
}
