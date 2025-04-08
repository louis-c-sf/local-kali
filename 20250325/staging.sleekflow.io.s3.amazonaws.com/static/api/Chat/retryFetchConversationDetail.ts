import ConversationType from "../../types/ConversationType";
import { get } from "../apiRequest";
import { GET_CONVERSATIONS_DETAIL } from "../apiPath";

export async function retryFetchConversationDetail(conversationId: string) {
  let retryAttempts = 3;
  const attemptsCallApi = async (): Promise<ConversationType | undefined> => {
    if (retryAttempts <= 0) {
      return undefined;
    }
    try {
      return await get(
        GET_CONVERSATIONS_DETAIL.replace("{id}", conversationId),
        {
          param: {},
        }
      );
    } catch (error) {
      retryAttempts--;
      return await attemptsCallApi();
    }
  };
  return attemptsCallApi();
}
