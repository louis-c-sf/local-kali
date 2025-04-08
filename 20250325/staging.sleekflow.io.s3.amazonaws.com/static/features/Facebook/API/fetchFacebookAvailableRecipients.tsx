import { FacebookAvailableRecipientsType } from "features/Facebook/models/FacebookOTNTypes";
import { getWithExceptions } from "../../../api/apiRequest";

export async function fetchFacebookAvailableRecipients(
  topicId: string
): Promise<FacebookAvailableRecipientsType> {
  return await getWithExceptions(`/FbOtnTopic/${topicId}/AvailableRecipients`, {
    param: {},
  });
}
