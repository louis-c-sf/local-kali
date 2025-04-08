import { postWithExceptions } from "../apiRequest";
import { POST_TELEGRAM_GENERATE_QR } from "../apiPath";
import { QRCodeResponseType } from "../../component/CreateWhatsappFlow/CompleteOfficialVerification/QRCodeStart";

export async function generateTelegramQrCode(
  botUserName: string
): Promise<QRCodeResponseType> {
  return await postWithExceptions(POST_TELEGRAM_GENERATE_QR, {
    param: {
      botUserName,
    },
  });
}
