import { senderDisplayName } from "../utils/staffDisplayName";
import MessageType from "../../../types/MessageType";
import { ProfileType } from "../../../types/LoginType";
import { parseAndFormatAnyPhone } from "../../Channel/selectors";

export function getClientName(message: MessageType, profile?: ProfileType) {
  return profile?.whatsAppAccount?.is_group
    ? senderDisplayName(
        message.sender?.name,
        message.sender?.phone_number &&
          (parseAndFormatAnyPhone(message.sender.phone_number) ||
            message.sender?.phone_number)
      )
    : "";
}
