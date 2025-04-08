import { getWithExceptions } from "api/apiRequest";
import { FacebookOTNTopicsType } from "features/Facebook/models/FacebookOTNTypes";

export async function fetchFacebookOTNTopics(
  pageId: string
): Promise<FacebookOTNTopicsType[]> {
  return await getWithExceptions(`/FbOtnTopic/${pageId}`, {
    param: {},
  });
}
