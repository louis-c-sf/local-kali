import MessageType from "../../../types/MessageType";
import {
  EmailAddressType,
  FacebookAccountType,
  WebClientType,
  WhatsAppAccountType,
} from "../../../types/LoginType";

export const checkIsStaff = (
  message: MessageType,
  accountType:
    | WhatsAppAccountType
    | FacebookAccountType
    | WebClientType
    | EmailAddressType
    | undefined,
  field: string
): boolean => {
  //TODO: do after converting sender and receiver of the message

  if (message.channel === "wechat") {
    return !message[`${field}Id`];
  }
  if (message.channel.toLowerCase() === "line") {
    if (message[`${field}Id`]) {
      return false;
    }
    return true;
  }
  if (message.channel === "web") {
    if (
      (message.sender && Object.keys(message.sender).length > 0) ||
      (message.receiver && Object.keys(message.receiver).length > 0)
    ) {
      return false;
    }
    return true;
  }
  if (message[`${field}Id`] && accountType) {
    let id = "";
    if (message.channel === "facebook" || message.channel === "whatsapp") {
      id = (accountType as FacebookAccountType | WhatsAppAccountType).id;
    } else if (message.channel === "email") {
      id = (accountType as EmailAddressType).email;
    }
    if (id !== message[`${field}Id`]) {
      return true;
    }
    return false;
  } else {
    return false;
  }
};
