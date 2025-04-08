import MessageType, {
  isDeletedMessage,
  isInteractiveMessage,
  isTextMessage,
} from "../../../types/MessageType";
import { isProxyMessage } from "../../Chat/mutators/mergeMessages";
import moment from "moment";
import { InboxStateType } from "../../../types/state/InboxStateType";

export class ChatGuard {
  constructor(private pickingMessages: InboxStateType["pickingMessages"]) {}

  canSendAsMessage(message: MessageType) {
    return this.isActiveMessage(message);
  }

  canForwardMessage(message: MessageType) {
    return this.isActiveMessage(message);
  }

  canReplyMessage(message: MessageType) {
    return (
      (this.isChatApi(message) || this.isCloudApi(message)) &&
      this.isActiveMessage(message) &&
      message.channel !== "note"
    );
  }

  canDeleteMessage(message: MessageType) {
    return (
      this.isChatApi(message) &&
      Boolean(message.isSenderStaff) &&
      this.isActiveMessage(message) &&
      this.isInDeleteTimeWindow(message)
    );
  }

  canDeleteScheduledMessage(message: MessageType) {
    return Boolean(message.status === "Scheduled" && message.id);
  }

  canCopyText(message: MessageType) {
    return isTextMessage(message);
  }

  canSendInteractiveMessage(channel: string) {
    return ["whatsapp360dialog", "whatsappcloudapi"].includes(
      channel.toLowerCase()
    );
  }

  canPickMessage(message: MessageType) {
    if (this.pickingMessages.mode === "delete") {
      return this.canDeleteMessage(message);
    } else if (this.pickingMessages.mode === "forward") {
      return this.canForwardMessage(message);
    }
    return false;
  }

  private isActiveMessage(message: MessageType) {
    return (
      !isProxyMessage(message) &&
      // TODO: Allow extracting message content from interactive message
      !isInteractiveMessage(message) &&
      Boolean(message.id) &&
      !isDeletedMessage(message)
    );
  }

  private isChatApi(message: MessageType) {
    return message.channelName === "whatsapp_chatapi";
  }

  private isCloudApi(message: MessageType) {
    return message.channelName === "whatsappcloudapi";
  }

  private isInDeleteTimeWindow(message: MessageType) {
    const messageTime = moment.utc(message.createdAt);
    return messageTime.isValid() && moment.utc().diff(messageTime, "hours") < 1;
  }
}
