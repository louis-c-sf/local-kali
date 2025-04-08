import MessageType from "types/MessageType";
import { ConnectedChannelsResponseType } from "api/CloudAPI/fetchConnectedCatalogChannels";

export function isWhatsappMessageInCatalog(
  message: MessageType,
  channels: ConnectedChannelsResponseType[]
): boolean {
  if (!message.whatsappCloudApiSender) {
    return false;
  }
  return channels.some((c) => {
    return (
      c.whatsappPhoneNumber ===
      message.whatsappCloudApiSender?.whatsappChannelPhoneNumber
    );
  });
}
