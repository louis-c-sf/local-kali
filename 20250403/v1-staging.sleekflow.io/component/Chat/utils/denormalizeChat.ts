import MessageType from "../../../types/MessageType";
import MessageConversion from "../../../config/MessageConversion";
import { checkIsStaff } from "./checkIsStaff";
import { ProfileType } from "../../../types/LoginType";
import { ProfileChannelField } from "../../../config/ProfileFieldMapping";

export const getSenderReceiverId = (
  message: MessageType,
  field: string | string[]
) => {
  if (typeof field === "string") {
    return message[field] || "";
  } else {
    let messageObj = "";
    for (const key in field) {
      messageObj =
        (messageObj && messageObj[field[key]]) || message[field[key]];
      if (typeof messageObj === "string") {
        return messageObj;
      }
    }
    return "";
  }
};

export const convertMessageToGeneralFormat = (
  message: MessageType,
  profile: ProfileType
): MessageType => {
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

  let mergedMessage = {
    ...message,
    sender: {
      ...(message.sender || {}),
      ...(messageFormat ? message[messageFormat.sender] : {}),
    },
    receiver: {
      ...(message.receiver || {}),
      ...(messageFormat ? message[messageFormat.receiver] : {}),
    },
    receiverId,
    senderId,
  };

  let isReceiverStaff = false;
  if (message.channel !== "note") {
    const accountChannelType = ProfileChannelField[message.channel] || "";
    const accountType =
      profile[accountChannelType] || message[accountChannelType];
    isReceiverStaff =
      checkIsStaff(mergedMessage, accountType, "receiver") ||
      !message.isSentFromSleekflow;
  }

  return {
    ...mergedMessage,
    isReceiverStaff,
    isSenderStaff: !isReceiverStaff,
  };
};

export function getSender(message: MessageType) {
  const messageFormat = MessageConversion[message.channel.toLowerCase()];
  if (!messageFormat) {
    return { ...(message.sender || {}) };
  }
  return { ...(message.sender || {}), ...message[messageFormat.sender] };
}

export function getReceiver(message: MessageType) {
  const messageFormat = MessageConversion[message.channel.toLowerCase()];
  if (!messageFormat) {
    return { ...(message.receiver || {}) };
  }
  return { ...(message.receiver || {}), ...message[messageFormat.receiver] };
}
