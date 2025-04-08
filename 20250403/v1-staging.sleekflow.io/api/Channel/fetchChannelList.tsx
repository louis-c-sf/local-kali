import { get } from "api/apiRequest";
import {
  ConnectedChannelType,
  UnConnectedChannelType,
} from "component/CreateWhatsappFlow/types";

type FacebookWabaChannelResponseType = {
  whatsappCloudApiConfigs: ConnectedChannelType[];
  unconnectedWabaPhoneNumberChannels: UnConnectedChannelType[];
};
export async function fetchChannelList(): Promise<FacebookWabaChannelResponseType> {
  return await get("/company/whatsapp/cloudapi/channel", { param: {} });
}
