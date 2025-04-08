import {
  SEND_MESSAGE_DEFAULT_CHANNEL_ID,
  SendMediaAutomationActionType,
  SendMessageAutomationActionType,
} from "../../../../types/AutomationActionType";
import useCompanyChannels from "../../../Chat/hooks/useCompanyChannels";
import { DropdownSelectionOptionType } from "../../../Chat/ChannelFilterDropdown";
import { TargetedChannelType } from "../../../../types/BroadcastCampaignType";
import { both, flatten } from "ramda";
import produce from "immer";
import { ChannelType } from "../../../Chat/Messenger/types";
import GenericDropdown from "../../../Form/GenericDropdown";
import { Dropdown, Image } from "semantic-ui-react";
import React from "react";
import { useTransformChannelsToDropdown } from "../../../Chat/localizable/useTransformChannelsToDropdown";
import { QrCodeChannelActionType } from "../../../Settings/types/SettingTypes";
import { useTranslation } from "react-i18next";
import convertTargetChannelsToChannelConfigured from "../../../Settings/helpers/convertTargetChannelsToChannelConfigured";

export function TargetChannelDropdown<
  T extends
    | SendMessageAutomationActionType
    | SendMediaAutomationActionType
    | QrCodeChannelActionType
>(props: {
  action: T;
  setAction: (action: T) => void;
  defaultWhatsappChannels?: TargetedChannelType[];
  disabled?: boolean;
  hasDefaultChoice?: boolean;
}) {
  const {
    action,
    setAction,
    defaultWhatsappChannels = [],
    disabled = false,
    hasDefaultChoice = true,
  } = props;
  const companyChannels = useCompanyChannels();
  const { transformChannelsToDropdown } = useTransformChannelsToDropdown();
  const { t } = useTranslation();
  const defaultChoice: DropdownSelectionOptionType = {
    text: t("automation.field.channels.defaultText"),
    value: SEND_MESSAGE_DEFAULT_CHANNEL_ID,
    key: -1,
    instanceId: undefined,
    img: "",
  };
  const channelsDropdown =
    defaultWhatsappChannels.length === 0
      ? companyChannels.filter((ch) => /whatsapp/i.test(ch.name))
      : convertTargetChannelsToChannelConfigured(
          companyChannels,
          defaultWhatsappChannels
        );

  let channelChoices: Array<DropdownSelectionOptionType> = [
    ...transformChannelsToDropdown(channelsDropdown, true),
  ];
  channelChoices = hasDefaultChoice
    ? [defaultChoice].concat(channelChoices)
    : channelChoices;

  const matchesChannelType =
    (name: string) => (c: DropdownSelectionOptionType) =>
      c.value === name;
  const matchesChannelId = (id: string) => (c: DropdownSelectionOptionType) =>
    c.instanceId === id;

  let selectedChannel: DropdownSelectionOptionType = { ...defaultChoice };
  const [currentChannel] = action.targetedChannelWithIds ?? [];

  if (currentChannel) {
    selectedChannel =
      channelChoices.find(matchesChannel(currentChannel)) ?? selectedChannel;
  }

  function matchesChannel(channel: TargetedChannelType) {
    const basePredicate = matchesChannelType(channel.channel);
    if (channel.ids && channel.ids.length > 0) {
      const [id] = channel.ids;
      return both(basePredicate, matchesChannelId(id));
    }
    return basePredicate;
  }

  function changeHandler(event: unknown, data: DropdownSelectionOptionType) {
    setAction(
      produce(action, (draft) => {
        const [option] = flatten([data]);
        const newValue: TargetedChannelType = {
          channel: option.value as ChannelType,
        };

        if (option.value === SEND_MESSAGE_DEFAULT_CHANNEL_ID) {
          draft.targetedChannelWithIds = [];
          return;
        }

        newValue.ids = option.instanceId ? [option.instanceId] : [];
        draft.targetedChannelWithIds = [newValue];
      })
    );
  }

  return (
    <GenericDropdown<DropdownSelectionOptionType, DropdownSelectionOptionType>
      selection
      fluid
      className={"channels-dropdown"}
      options={channelChoices}
      value={selectedChannel}
      multiple={false}
      disabled={disabled}
      onChange={changeHandler}
      text={selectedChannel.text}
      serializeItem={(channel) =>
        JSON.stringify([channel.value, channel.instanceId])
      }
      unserializeItem={(item) => {
        const [value, instanceId] = JSON.parse(item);
        const sampleChannel: TargetedChannelType = {
          channel: value,
          ids: instanceId ? [instanceId] : undefined,
        };
        return channelChoices.find(matchesChannel(sampleChannel))!;
      }}
      renderChoice={(choice, index) => {
        return (
          <Dropdown.Item key={index}>
            <div className="text">
              <Image src={choice.img} hidden={!choice.img} />
              <span className={"text-label"}>{choice.text}</span>
            </div>
          </Dropdown.Item>
        );
      }}
    />
  );
}
