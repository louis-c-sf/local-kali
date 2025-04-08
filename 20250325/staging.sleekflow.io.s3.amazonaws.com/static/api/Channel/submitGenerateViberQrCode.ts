import { postWithExceptions } from "../apiRequest";
import { POST_VIBER_GENERATE_QR_CODE } from "../apiPath";

export async function submitGenerateViberQrCode(
  uri: string
): Promise<{ url: string; qrcodeBase64: string }> {
  return postWithExceptions(POST_VIBER_GENERATE_QR_CODE, {
    param: {
      uri,
    },
  });
}
