import { ChannelConfiguredType } from "../Messenger/types";
import { DropdownSelectionOptionType } from "../ChannelFilterDropdown";
import { ChannelOptionValueType, toOptionValues } from "../mutators";
import { iconFactory } from "../hooks/useCompanyChannels";
import { useTranslation } from "react-i18next";
import { useChatChannelLocales } from "./useChatChannelLocales";

export type ChannelDropdownOption = DropdownSelectionOptionType & {
  instanceId?: string;
};

export function useTransformChannelsToDropdown() {
  const { t } = useTranslation();
  const { optionText } = useChatChannelLocales();

  function transformMessagingChannelToDropdownOption(
    channel: ChannelOptionValueType,
    key: number,
    channels: ChannelConfiguredType<any>[]
  ): ChannelDropdownOption {
    return {
      key,
      instanceId: channel.id,
      value: channel.type,
      text: optionText(channel, channels),
      img: iconFactory(channel.type) ?? "",
    };
  }

  return {
    transformChannelsToDropdown(
      channels: ChannelConfiguredType<any>[],
      excludeAll: boolean
    ): ChannelDropdownOption[] {
      let startChannels = [];
      let channelsPassed: ChannelConfiguredType<any>[] = [...channels];
      let extraChannels: DropdownSelectionOptionType[] = [];

      if (!excludeAll) {
        startChannels.push({
          key: 0,
          value: "all",
          text: t("chat.filter.channel.group.all"),
          img: "",
        });
      }

      extraChannels = channelsPassed
        .reduce(toOptionValues, [])
        .map((channel: ChannelOptionValueType, key: number) =>
          transformMessagingChannelToDropdownOption(channel, key, channels)
        );

      return [...startChannels, ...extraChannels];
    },
  };
}
