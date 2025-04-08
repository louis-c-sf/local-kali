import { putWithExceptions } from "../apiRequest";
import { PUT_VIBER_RENAME_CHANNEL } from "../apiPath";

export async function submitRenameViberChannel(
  id: number,
  name: string,
  senderName: string
) {
  return await putWithExceptions(PUT_VIBER_RENAME_CHANNEL, {
    param: {
      viberChannelId: id,
      displayName: name,
      viberBotSenderName: senderName,
    },
  });
}
