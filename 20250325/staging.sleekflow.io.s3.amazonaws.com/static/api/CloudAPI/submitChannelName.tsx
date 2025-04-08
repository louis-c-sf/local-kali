import { postWithExceptions } from "api/apiRequest";
import { ConnectedWhatsappCloudApiConfigType } from "container/Onboarding/migrateNumber/types";

type ChannelNameResponseType = {
  connectedWhatsappCloudApiConfig: ConnectedWhatsappCloudApiConfigType;
};
export async function submitChannelName(props: {
  channelName: string;
  wabaId: string;
  wabaPhoneNumberId: string;
}): Promise<ChannelNameResponseType> {
  const { channelName, wabaId, wabaPhoneNumberId } = props;
  return await postWithExceptions("/company/whatsapp/cloudapi/channel", {
    param: {
      channelName,
      wabaId,
      wabaPhoneNumberId,
    },
  });
}
