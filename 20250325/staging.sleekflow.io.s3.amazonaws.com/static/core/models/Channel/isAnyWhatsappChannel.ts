import { WhatsappChannelType } from "component/Chat/Messenger/types";

export function isAnyWhatsappChannel(
  channel: string
): channel is WhatsappChannelType {
  return [
    "whatsapp360dialog",
    "twilio_whatsapp",
    "whatsapp_twilio",
    "whatsappcloudapi",
    "whatsapp",
  ].includes(channel);
}
