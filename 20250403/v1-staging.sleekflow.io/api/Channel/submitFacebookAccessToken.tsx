import { post } from "api/apiRequest";
import { UnConnectedChannelType } from "component/CreateWhatsappFlow/types";

export interface FacebookTokenWabaResponseType {
  connectedWaba: UnConnectedChannelType[];
}
export async function submitFacebookAccessToken(
  token: string
): Promise<FacebookTokenWabaResponseType> {
  return await post(
    "/company/whatsapp/cloudapi/waba/exchange-facebook-authorization-code",
    {
      param: {
        facebook_authorization_code: token,
      },
    }
  );
}
