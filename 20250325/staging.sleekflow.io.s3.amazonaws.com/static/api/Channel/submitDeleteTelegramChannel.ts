import { deleteMethodWithExceptions } from "../apiRequest";
import {
  DELETE_VIBER_DELETE_CHANNEL,
  DELETE_TELEGRAM_DELETE_CHANNEL,
} from "../apiPath";

export async function submitDeleteTelegramChannel(id: number) {
  return await deleteMethodWithExceptions(DELETE_TELEGRAM_DELETE_CHANNEL, {
    param: { telegramChannelId: id },
  });
}
