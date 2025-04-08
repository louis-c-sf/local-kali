import { putWithExceptions } from "../apiRequest";
import { PUT_TELEGRAM_RENAME_CHANNEL } from "../apiPath";

export async function submitRenameTelegramChannel(id: number, name: string) {
  return await putWithExceptions(PUT_TELEGRAM_RENAME_CHANNEL, {
    param: {
      telegramChannelId: id,
      displayName: name,
    },
  });
}
