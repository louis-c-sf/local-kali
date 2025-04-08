import { getWithExceptions } from "api/apiRequest";
import { FacebookOTNTopicValidTokenType } from "features/Facebook/models/FacebookOTNTypes";

export async function fetchFacebookOTNTopicValidToken(
  pageId: string,
  fbReceiverId: string
): Promise<FacebookOTNTopicValidTokenType[]> {
  return await getWithExceptions(`/FbOtnTopic/Token/${pageId}`, {
    param: {
      facebookReceiverId: fbReceiverId,
    },
  });
}
