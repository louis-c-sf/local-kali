import { postWithExceptions } from "../apiRequest";
import { POST_VIBER_CREATE_CHANNEL } from "../apiPath";
import { ViberConfigType } from "../../types/CompanyType";

export async function submitCreateViberChannel(
  name: string,
  token: string,
  senderName: string
): Promise<ViberConfigType> {
  return await postWithExceptions(POST_VIBER_CREATE_CHANNEL, {
    param: {
      botToken: token,
      displayName: name,
      viberBotSenderName: senderName,
    },
  });
}
