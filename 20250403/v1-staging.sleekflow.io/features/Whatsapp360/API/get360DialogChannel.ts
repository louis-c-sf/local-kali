import { WhatsApp360DialogConfigsType } from "../../../types/CompanyType";
import { ChannelTabType } from "../../../component/Settings/types/SettingTypes";
import { ChannelConfiguredType } from "../../../component/Chat/Messenger/types";

export function isWhatsApp360DialogConfigType(
  config: any
): config is WhatsApp360DialogConfigsType {
  return config.whatsAppPhoneNumber !== undefined;
}

export function isWhatsapp360Channel(
  channel: ChannelConfiguredType<any>,
  wabaId: string
) {
  return (
    "whatsapp360dialog" === channel.type &&
    channel.configs?.some(
      (c) => isWhatsApp360DialogConfigType(c) && c.wabaAccountId === wabaId
    )
  );
}

export default function get360DialogChannel(
  selectedChannelTab: ChannelTabType | undefined,
  companyChannels: ChannelConfiguredType<any>[]
) {
  return selectedChannelTab?.wabaId
    ? companyChannels.find((c) =>
        isWhatsapp360Channel(c, selectedChannelTab.wabaId!)
      )
    : companyChannels.find((c) =>
        c.configs?.some(
          (config) =>
            isWhatsApp360DialogConfigType(config) &&
            selectedChannelTab?.is360Dialog &&
            selectedChannelTab?.ids?.includes(config.id)
        )
      );
}
