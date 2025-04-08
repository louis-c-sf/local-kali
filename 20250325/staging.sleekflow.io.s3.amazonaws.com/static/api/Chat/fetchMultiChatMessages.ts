import MessageType from "../../types/MessageType";
import { get } from "../apiRequest";
import { GET_All_CONVERSATIONS_MESSAGES } from "../apiPath";
import { mergeMessages } from "../../component/Chat/mutators/mergeMessages";
interface FetchConversationMessageResponseType {
  hasNext: boolean;
  messages: MessageType[];
}
export async function fetchMultiChatMessages(
  afterTimestamp: number,
  beforeTimestamp: number
) {
  let messages: MessageType[] = [];
  const attemptsCallApi = async (
    retryAttempts: number
  ): Promise<FetchConversationMessageResponseType | undefined> => {
    if (retryAttempts <= 0) {
      return Promise.resolve({
        hasNext: false,
        messages,
      });
    }
    try {
      const remainingMessage = messages.length % 10;
      if (remainingMessage === 0) {
        const result = await get(GET_All_CONVERSATIONS_MESSAGES, {
          param: {
            afterTimestamp,
            beforeTimestamp: beforeTimestamp,
            limit: 10,
            offset: messages.length,
          },
        });
        messages = mergeMessages(messages, result.messages);
        if (result.hasNext) {
          return attemptsCallApi(retryAttempts);
        } else {
          return Promise.resolve({
            hasNext: false,
            messages,
          });
        }
      } else {
        return Promise.resolve({
          hasNext: false,
          messages,
        });
      }
    } catch (error) {
      return attemptsCallApi(retryAttempts--);
    }
  };
  return attemptsCallApi(3);
}
