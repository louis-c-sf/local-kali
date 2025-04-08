import React, { useEffect } from "react";
import { Dropdown, DropdownProps, Image } from "semantic-ui-react";
import {
  POST_360DIALOG_CHANGE_CHANNEL,
  POST_COMPANY_WHATSAPP_CHATAPI_ASSIGN_INSTANCE,
} from "../../api/apiPath";
import SelectedDropdownWithImage from "./SelectedDropdownWithImage";
import { aliasChannelName } from "../Channel/selectors";
import { ChannelType } from "./Messenger/types";
import { post } from "../../api/apiRequest";
import { useFlashMessageChannel } from "../BannerMessage/flashBannerMessage";
import { DropdownSelectionOptionType } from "./ChannelFilterDropdown";
import { equals, init, prop } from "ramda";
import { InfoTooltip } from "../shared/popup/InfoTooltip";
import { useTranslation } from "react-i18next";
import useDefaultChannelSelection from "./useDefaultChannelSelection";
import { useAppDispatch, useAppSelector } from "../../AppRootContext";
import headerDropdownStyles from "../Chat/ChatHeader/HeaderDropdown.module.css";
import useGetCurrentChannel from "./useGetCurrentChannel";
import { getChannelInstanceId } from "component/Chat/utils/useChatSelectors";
import { htmlEscape } from "../../lib/utility/htmlEscape";
import { iconFactory } from "./hooks/useCompanyChannels";
export const ChatChannelDropdown = React.memo(function ChatChannelDropdown({
  selectedChannelItem,
  setSelectedChannelItem,
}: {
  selectedChannelItem: DropdownSelectionOptionType | undefined;
  setSelectedChannelItem: (
    channel: DropdownSelectionOptionType | undefined
  ) => void;
}) {
  const profile = useAppSelector((s) => s.profile, equals);
  const messagesFilter = useAppSelector((s) => s.inbox.messagesFilter, equals);

  const loginDispatch = useAppDispatch();
  const { t } = useTranslation();
  const flash = useFlashMessageChannel();

  const { channels } = useDefaultChannelSelection();
  const { currentChannel, currentChannelId } =
    useGetCurrentChannel(messagesFilter);

  useEffect(() => {
    if (channels.length === 0 && !profile.isSandbox) {
      return;
    }
    let initChannelSelected: DropdownSelectionOptionType | undefined =
      undefined;
    if (profile.isSandbox) {
      setSelectedChannelItem({
        text: t("channels.display.sandbox"),
        img: iconFactory("whatsapp"),
        key: 1,
        value: t("channels.display.sandbox"),
      });
      loginDispatch({
        type: "UPDATE_CHAT_CHANNEL",
        selectedChannelFromConversation: "whatsapp",
        selectedChannelIdFromConversation: "",
      });
      return;
    }

    if (currentChannel) {
      initChannelSelected = getChannelOptionMatch(
        currentChannel,
        channels,
        currentChannelId,
        profile.lastChannel
      );
    } else {
      if (profile.whatsAppAccount?.id) {
        const isTwilio = profile.whatsAppAccount.is_twilio;
        const channelName = isTwilio ? "twilio_whatsapp" : "whatsapp";
        initChannelSelected = getChannelOptionMatch(
          channelName,
          channels,
          getChannelInstanceId(channelName, profile)
        );
      } else if (profile.whatsApp360DialogUser) {
        initChannelSelected = getChannelOptionMatch(
          "whatsapp360dialog",
          channels,
          getChannelInstanceId("whatsapp360dialog", profile)
        );
      } else if (profile.whatsappCloudApiUser) {
        initChannelSelected = getChannelOptionMatch(
          "whatsappcloudapi",
          channels,
          getChannelInstanceId("whatsappcloudapi", profile)
        );
      } else {
        initChannelSelected = channels[0];
      }
    }
    setSelectedChannelItem(initChannelSelected);
    loginDispatch({
      type: "UPDATE_CHAT_CHANNEL",
      selectedChannelFromConversation: initChannelSelected?.value ?? "",
      selectedChannelIdFromConversation: initChannelSelected?.instanceId,
    });

    return () => {
      setSelectedChannelItem(undefined);
    };
  }, [
    profile.id,
    currentChannel,
    currentChannelId,
    channels.map(prop("key")).join(),
    JSON.stringify(messagesFilter),
  ]);

  async function switchChannel(data: DropdownProps) {
    const newChannelValue = unwrapStringOptionValue(data.value as string);
    if (newChannelValue === undefined) {
      return;
    }
    const prevChannelValue = selectedChannelItem
      ? { ...selectedChannelItem }
      : undefined;
    setSelectedChannelItem(newChannelValue);

    try {
      if (
        newChannelValue.value.toLowerCase() === "whatsapp" &&
        newChannelValue.instanceId !== profile.whatsAppAccount?.instanceId
      ) {
        await post(
          POST_COMPANY_WHATSAPP_CHATAPI_ASSIGN_INSTANCE.replace(
            "{id}",
            profile.id
          ),
          { param: { instanceId: newChannelValue.instanceId } }
        );
        flash(t("flash.profile.channel.updated"));
      } else if (newChannelValue.value === "twilio_whatsapp") {
        // todo what else to check before sending? Twilio instance ID?
        await post(
          POST_COMPANY_WHATSAPP_CHATAPI_ASSIGN_INSTANCE.replace(
            "{id}",
            profile.id
          ),
          { param: { instanceId: newChannelValue.instanceId } }
        );
        flash(t("flash.profile.channel.updated"));
      } else if (newChannelValue.value === "whatsapp360dialog") {
        await post(POST_360DIALOG_CHANGE_CHANNEL, {
          param: {
            configId: Number(newChannelValue.instanceId),
            userProfileId: profile.id,
          },
        });
        flash(t("flash.profile.channel.updated"));
      } else if (newChannelValue.value === "whatsappcloudapi") {
        await post("/userprofile/whatsapp/cloudapi/switch-channel", {
          param: {
            whatsappChannelPhoneNumber: Number(newChannelValue.instanceId),
            userProfileId: profile.id,
          },
        });
        flash(t("flash.profile.channel.updated"));
      }
      const channelName = aliasChannelName(
        newChannelValue.value as ChannelType
      );
      loginDispatch({
        type: "UPDATE_CHAT_CHANNEL",
        selectedChannelFromConversation: channelName,
        selectedChannelIdFromConversation: newChannelValue.instanceId,
      });
      loginDispatch({
        type: "INBOX.MESSAGE_FILTER.UPDATED",
        channelName: channelName,
        channelId: newChannelValue.instanceId,
        mode: "filter",
      });
    } catch (e) {
      loginDispatch({
        type: "UPDATE_CHAT_CHANNEL",
        selectedChannelFromConversation: currentChannel ?? "",
        selectedChannelIdFromConversation: currentChannelId,
      });
      setSelectedChannelItem(prevChannelValue);
      console.error(e, { prevChannelValue, channelValuesNew: newChannelValue });
    }
  }

  if (!selectedChannelItem) {
    return <div></div>;
  }

  const dropdown = (
    <Dropdown
      selectOnBlur={false}
      upward={true}
      className={`channels-dropdown ${headerDropdownStyles.dropdown}`}
      trigger={
        <SelectedDropdownWithImage
          image={selectedChannelItem.img}
          text={selectedChannelItem.text}
          adaptive
        />
      }
      scrolling
      onChange={(_, data) => switchChannel(data)}
      value={wrapOptionToString(selectedChannelItem)}
      options={channels.map((channel, i) => {
        const img = channel.img;
        const { instanceId, ...dropdownFields } = channel;
        return {
          ...dropdownFields,
          image: null,
          key: `${instanceId}_${i}`,
          content: (
            <div
              className={`text ${img ? "text_has-img" : "text_no-image"}`}
              title={htmlEscape(channel.text)}
            >
              {img && <Image src={img} alt={htmlEscape(channel.text)} />}
              <span className={"text-label"}>{channel.text}</span>
            </div>
          ),
          value: wrapOptionToString(channel),
        };
      })}
    />
  );

  return (
    <InfoTooltip
      trigger={dropdown}
      children={t("chat.tooltip.channel.switch")}
      placement={"right"}
    />
  );
});

export function unwrapStringOptionValue(
  value: string
): DropdownSelectionOptionType | undefined {
  try {
    return JSON.parse(value);
  } catch (e) {
    console.error("unwrapStringOptionValue", e);
    return;
  }
}

export function wrapOptionToString(
  optionValue: DropdownSelectionOptionType | string
): string {
  return JSON.stringify(optionValue);
}

export default ChatChannelDropdown;

const matchesChannel = (channelName: string, channelInstanceId?: string) => {
  return (c: DropdownSelectionOptionType) =>
    [
      "whatsapp",
      "twilio_whatsapp",
      "facebook",
      "instagram",
      "whatsapp360dialog",
      "whatsappcloudapi",
    ].includes(channelName)
      ? c.instanceId === channelInstanceId &&
        aliasChannelName(c.value as ChannelType) === channelName
      : (c.value as ChannelType) === channelName;
};

export function getChannelOptionMatch(
  channelName: string,
  channelList: DropdownSelectionOptionType[],
  channelInstanceId?: string,
  profileLastChannel?: string
) {
  const optionMatched = channelList.find(
    matchesChannel(
      aliasChannelName(channelName as ChannelType),
      channelInstanceId
    )
  );
  const [channel] = channelList;
  const lastChannel =
    channelList.find(
      matchesChannel(
        aliasChannelName(profileLastChannel as ChannelType),
        channelInstanceId
      )
    ) ?? channel;
  return (
    optionMatched ??
    (channelName.includes("whatsapp")
      ? channelList.find(matchesChannel(channelName, channelInstanceId)) ??
        lastChannel
      : lastChannel)
  );
}
