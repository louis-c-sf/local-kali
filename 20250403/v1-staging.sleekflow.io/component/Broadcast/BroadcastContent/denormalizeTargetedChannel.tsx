import { ChannelConfiguredType } from "../../Chat/Messenger/types";
import { TargetedChannelType } from "../../../types/BroadcastCampaignType";
import { WhatsappCloudAPIConfigType } from "features/WhatsappCloudAPI/models/WhatsappCloudAPIConfigType";

function checkPhoneNumberExist(phoneNumber: string) {
  return (config: WhatsappCloudAPIConfigType) =>
    config.whatsappPhoneNumber === phoneNumber;
}

export function denormalizeTargetedChannel(
  companyChannels: ChannelConfiguredType<any>[],
  targetedChannelType: TargetedChannelType[]
): TargetedChannelType[] {
  const filterCompanyOfficialChannelIds = companyChannels
    .filter((chnl) => chnl.type === "twilio_whatsapp")
    .reduce(
      (officialIds: string[], curr) => [
        ...officialIds,
        ...(curr.configs?.map((config) => config.twilioAccountId) ?? []),
      ],
      []
    );
  return targetedChannelType.reduce((arr: TargetedChannelType[], curr) => {
    if (curr.channel === "whatsapp") {
      if (curr.ids?.some((c) => filterCompanyOfficialChannelIds.includes(c))) {
        return [
          ...arr,
          {
            channel: "twilio_whatsapp",
            ids: curr.ids,
          },
        ];
      } else {
        return [
          ...arr,
          {
            channel: curr.channel,
            ids: curr.ids,
          },
        ];
      }
    }
    if (curr.channel === "whatsappcloudapi") {
      const cloudApiConfigs = companyChannels.find(
        (chl) => chl.type === "whatsappcloudapi"
      )?.configs;

      const ids = curr.ids
        ?.filter((phoneNumber) =>
          cloudApiConfigs?.some(checkPhoneNumberExist(phoneNumber))
        )
        .map((phoneNumber) =>
          String(
            cloudApiConfigs?.find(checkPhoneNumberExist(phoneNumber))
              ?.whatsappPhoneNumber
          )
        );
      return [...arr, { ...curr, ids }];
    }
    return [...arr, curr];
  }, []);
}
