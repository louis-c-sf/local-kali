import { getWithExceptions } from "api/apiRequest";
import { FacebookOTNAmountTokenType } from "features/Facebook/models/FacebookOTNTypes";

export async function fetchFacebookOTNAmountToken(
  pageId: string,
  facebookReceiverId: string
): Promise<FacebookOTNAmountTokenType> {
  return await getWithExceptions(`/FbOtnTopic/TokenNumber/${pageId}`, {
    param: {
      facebookReceiverId,
    },
  });
}
