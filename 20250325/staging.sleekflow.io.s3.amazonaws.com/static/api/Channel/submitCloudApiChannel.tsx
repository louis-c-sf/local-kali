import { post } from "api/apiRequest";

export async function submitCloudApiChannel(props: {
  channelName: string;
  wabaId: string;
  wabaPhoneNumberId: string;
}) {
  const { channelName, wabaId, wabaPhoneNumberId } = props;
  return await post("/company/whatsapp/cloudapi/channel", {
    param: {
      channelName,
      wabaId,
      wabaPhoneNumberId,
    },
  });
}
