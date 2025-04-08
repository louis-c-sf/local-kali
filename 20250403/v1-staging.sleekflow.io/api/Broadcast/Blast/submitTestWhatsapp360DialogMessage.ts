import { postWithExceptions } from "../../apiRequest";
import { BlastCampaignPayloadInterface } from "./submitBlastWhatsapp360DialogCampaign";

export function submitTestWhatsapp360DialogMessage(
  payload: Whatsapp360DialogTestMessagePayload
): Promise<TestResponse> {
  return postWithExceptions("/blast-message/whatsapp/360dialog/test", {
    param: payload,
  });
}

export interface Whatsapp360DialogTestMessagePayload
  extends BlastCampaignPayloadInterface {
  userProfileIds: string[];
}

interface TestResponse {
  testBlastMessageSummary: {
    sentCount: number;
    errorCount: number;
    details: Array<{
      userProfileId: string;
      phoneNumber: string;
      messageUniqueId: string;
      errorMessage: string;
      isSuccess: boolean;
    }>;
  };
}
