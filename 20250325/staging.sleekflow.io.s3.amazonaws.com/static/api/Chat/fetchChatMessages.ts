import MessageType from "../../types/MessageType";
import { get } from "../apiRequest";
import { GET_CONVERSATIONS_MESSAGES } from "../apiPath";
import { ChatMessageRequestType } from "../../component/Chat/ChatRecords";

export async function fetchChatMessages(
  param: ChatMessageRequestType,
  currentChatId: string
) {
  let retryAttempts = 3;
  const attemptsCallApi = (): Promise<MessageType[] | undefined> => {
    if (retryAttempts <= 0) {
      return Promise.resolve([]);
    }
    try {
      return get(GET_CONVERSATIONS_MESSAGES.replace("{id}", currentChatId), {
        param: {
          ...param,
        },
        config: {
          timeout: 4000,
        },
      });
    } catch (error) {
      retryAttempts--;
      return attemptsCallApi();
    }
  };
  return attemptsCallApi();
}
