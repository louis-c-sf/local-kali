import MessageType from "../../../types/MessageType";
import MessageConversion from "../../../config/MessageConversion";
import { ProfileType } from "../../../types/LoginType";
import { ProfileChannelField } from "../../../config/ProfileFieldMapping";
import moment from "moment";
import ProfileSearchType from "../../../types/ProfileSearchType";
import { checkIsStaff } from "../utils/checkIsStaff";
import {
  getSenderReceiverId,
  getSender,
  getReceiver,
} from "../utils/denormalizeChat";
import { sortedFromOldest } from "./sortedFromOldest";

export function normalizeApiMessage(
  origMessage: MessageType,
  profile?: ProfileType | ProfileSearchType
) {
  const accountChannelType = ProfileChannelField[origMessage.channel] || "";
  const accountType =
    profile?.[accountChannelType] ?? origMessage[accountChannelType];
  const mergedMessage = convertMessageToGeneralFormat(origMessage);
  const isReceiverStaff =
    origMessage.channel === "note"
      ? false
      : checkIsStaff(mergedMessage, accountType, "receiver") ||
        !origMessage.isSentFromSleekflow;
  return {
    ...mergedMessage,
    isReceiverStaff,
    isSenderStaff: !isReceiverStaff,
  };
}

export function normalizeAPIMessagesPage(
  messages: MessageType[],
  profile?: ProfileType
) {
  return sortedFromOldest(messages).map((m) => normalizeApiMessage(m, profile));
}

function convertMessageToGeneralFormat(message: MessageType): MessageType {
  const messageFormat = MessageConversion[message.channel.toLowerCase()];
  const receiverId =
    getSenderReceiverId(
      message,
      (messageFormat && messageFormat.receiverId) || ""
    ) || "";
  const senderId =
    getSenderReceiverId(
      message,
      (messageFormat && messageFormat.senderId) || ""
    ) || "";

  return {
    ...message,
    createdAt: moment.utc(message.createdAt).format(),
    sender: getSender(message),
    receiver: getReceiver(message),
    receiverId,
    senderId,
  };
}

export function messageTime<
  M extends { createdAt?: string; updatedAt?: string }
>(message: M): moment.Moment | undefined {
  const time = message.createdAt || message.updatedAt;
  if (!time) {
    return undefined;
  }
  const momentParsed = moment(time);
  return momentParsed.isValid() ? momentParsed : undefined;
}
