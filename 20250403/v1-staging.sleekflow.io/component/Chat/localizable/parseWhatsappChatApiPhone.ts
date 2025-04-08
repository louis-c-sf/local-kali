import { WhatsAppChatAPIConfigType } from "../../../types/CompanyType";
import { parseAndFormatAnyPhone } from "../../Channel/selectors";

export function parseWhatsappChatApiPhone(config: WhatsAppChatAPIConfigType) {
  const sender = config?.whatsAppSender;
  if (!sender) {
    return;
  }
  let match = sender.match(/^(\d+)(?=@)/) ?? undefined;
  if (!match) {
    match = sender.match(/whatsapp:\+(\d+)/) ?? undefined;
  }
  return match ? parseAndFormatAnyPhone(match[1]) : undefined;
}
