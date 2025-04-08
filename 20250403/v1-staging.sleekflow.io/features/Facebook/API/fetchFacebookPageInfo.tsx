import { getWithExceptions } from "api/apiRequest";
import { FacebookPageInfoType } from "features/Facebook/models/FacebookOTNTypes";

export async function fetchFacebookPageInfo(
  pageId: string
): Promise<FacebookPageInfoType> {
  return await getWithExceptions(`/FbOtnTopic/PageInformation/${pageId}`, {
    param: {},
  });
}
