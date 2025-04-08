import { postWithExceptions } from "api/apiRequest";

type PublicAPIKeyResponseType = {
  whatsapp360DialogOnboardingChannelInfo: {
    apiKey: string;
    phoneName: string;
    phoneNumber: string;
  };
};

export async function post360DialogAPIKey(
  clientId: string,
  channelId: string,
  partnerId: string
): Promise<PublicAPIKeyResponseType> {
  return postWithExceptions(
    `/company/whatsapp/360dialog/partner/onboarding/channel`,
    {
      param: {
        partnerId,
        clientId,
        channelId,
      },
    }
  );
}
