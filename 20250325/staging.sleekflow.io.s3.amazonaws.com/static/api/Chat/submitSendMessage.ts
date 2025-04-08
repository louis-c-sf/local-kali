import { post } from "../apiRequest";
import {
  SendInteractiveMessageType,
  SendInteractiveMessageWithContentType,
} from "../../types/SendMessageType";
import { trackMessageSend } from "component/Chat/Messenger/useSendMessage";

export async function submitSendMessage(
  param: SendInteractiveMessageType | SendInteractiveMessageWithContentType
) {
  return await post("/ConversationMessages/SendMessage", {
    param: param,
    header: {},
  }).then(() => trackMessageSend(param.channel ?? ""));
}
