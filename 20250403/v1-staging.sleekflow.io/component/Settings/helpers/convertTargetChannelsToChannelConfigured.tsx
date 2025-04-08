import { TargetedChannelType } from "../../../types/BroadcastCampaignType";
import { ChannelConfiguredType } from "../../Chat/Messenger/types";
import { flatten, intersection } from "ramda";

const convertTargetChannelsToChannelConfigured = (
  companyChannels: ChannelConfiguredType<any>[],
  defaultChannels: TargetedChannelType[]
): ChannelConfiguredType<any>[] => {
  const defaultChannelIdList = flatten(defaultChannels.map((row) => row.ids));
  const result: ChannelConfiguredType<any>[] = [];
  const getConfigId = (type: string, config: any) => {
    if (type === "whatsapp") {
      return config.wsChatAPIInstance;
    } else if (type === "twilio_whatsapp") {
      return config.twilioAccountId;
    } else if (type === "whatsappcloudapi") {
      return config.whatsappPhoneNumber;
    } else {
      console.error("unknown config type");
      return "";
    }
  };

  companyChannels.forEach((ch) => {
    if (
      ch.configs &&
      (ch.type === "whatsapp" ||
        ch.type === "twilio_whatsapp" ||
        ch.type === "whatsappcloudapi")
    ) {
      ch.configs.forEach((config) => {
        if (defaultChannelIdList.includes(getConfigId(ch.type, config))) {
          result.push({ ...ch, configs: [config] });
        }
      });
    }
  });
  return result;
};
export default convertTargetChannelsToChannelConfigured;
