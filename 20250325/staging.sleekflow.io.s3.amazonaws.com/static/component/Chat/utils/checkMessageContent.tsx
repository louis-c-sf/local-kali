import MessageType from "../../../types/MessageType";
import { htmlEntities } from "../../../lib/utility/htmlEntities";

export default function checkMessageContent(message: MessageType) {
  let messageContent = message.messageContent?.trim()
    ? message.messageContent
    : message.messageType;
  return htmlEntities(messageContent || "");
}
