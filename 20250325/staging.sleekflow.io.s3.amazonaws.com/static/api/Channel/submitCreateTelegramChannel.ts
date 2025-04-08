import { postWithExceptions } from "../apiRequest";
import {
  POST_VIBER_CREATE_CHANNEL,
  POST_TELEGRAM_CREATE_CHANNEL,
} from "../apiPath";
import { ViberConfigType, TelegramConfigType } from "../../types/CompanyType";

export async function submitCreateTelegramChannel(
  name: string,
  token: string
): Promise<TelegramConfigType> {
  return await postWithExceptions(POST_TELEGRAM_CREATE_CHANNEL, {
    param: {
      telegramBotToken: token,
      displayName: name,
    },
  });
}
