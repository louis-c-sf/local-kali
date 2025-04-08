import { postWithExceptions } from "../apiRequest";
import { POST_ONBOARDING_CONNECT_360DIALOG } from "../apiPath";

export async function submitCreate360DialogChannel(
  channelName: string,
  apiKey: string
): Promise<Create360DialogChannelResponseType> {
  return await postWithExceptions(POST_ONBOARDING_CONNECT_360DIALOG, {
    param: {
      channelName: channelName,
      apiKey: apiKey,
    },
  });
}

export type Create360DialogChannelResponseType = {
  id: number;
  companyId: string;
  channelName: string;
  whatsAppPhoneNumber: string;
  whatsAppChannelSetupName: string;
  channelStatus: string;
  accountMode: string;
  clientId: string;
  channelId: string;
  wabaAccountId: string;
  wabaStatus: string;
  wabaBusinessId: string;
  wabaAccountName: string;
  wabaBusinessStatus: string;
  wabaAccountType: string;
  isClient: boolean;
  accessLevel: number;
  isOptInEnable: true;
  optInConfig: {
    templateName: string;
    templateNamespace: string;
    language: string; // "af"
    readMoreTemplateButtonMessage: string;
  };
  createdAt: string;
  updatedAt: string;
};
