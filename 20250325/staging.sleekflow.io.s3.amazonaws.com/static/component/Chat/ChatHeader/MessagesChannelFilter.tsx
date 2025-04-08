import React, { useEffect } from "react";
import headerDropdownStyles from "./HeaderDropdown.module.css";
import SelectedDropdownWithImage from "../SelectedDropdownWithImage";
import { Dropdown, Image } from "semantic-ui-react";
import { wrapOptionToString } from "../ChatChannelDropdown";
import useDefaultChannelSelection from "../useDefaultChannelSelection";
import { useAppDispatch, useAppSelector } from "../../../AppRootContext";
import { ChannelDropdownOption } from "../localizable/useTransformChannelsToDropdown";
import { useTranslation } from "react-i18next";
import {
  POST_360DIALOG_CHANGE_CHANNEL,
  POST_COMPANY_WHATSAPP_CHATAPI_ASSIGN_INSTANCE,
} from "../../../api/apiPath";
import { post } from "../../../api/apiRequest";
import { aliasChannelName } from "../../Channel/selectors";
import { ChannelType } from "../Messenger/types";
import { useFlashMessageChannel } from "../../BannerMessage/flashBannerMessage";
import { htmlEscape } from "../../../lib/utility/htmlEscape";

export function MessagesChannelFilter(props: {}) {
  const { channels } = useDefaultChannelSelection();
  const loginDispatch = useAppDispatch();
  const { t } = useTranslation();

  const selectedChannel = useAppSelector(
    (s) => s.inbox.messagesFilter.channelName
  );
  const selectedChannelId = useAppSelector(
    (s) => s.inbox.messagesFilter.channelId
  );
  const selectedFrom = useAppSelector(
    (s) => s.inbox.messagesFilter.selectedFrom
  );
  const profileId = useAppSelector((s) => s.profile.id);
  const instanceId = useAppSelector(
    (s) => s.profile.whatsAppAccount?.instanceId
  );
  const channelId = useAppSelector(
    (s) => s.profile.whatsApp360DialogUser?.channelId
  );
  const flash = useFlashMessageChannel();
  const allChannelsChoice = {
    value: "ALL",
    text: t("chat.filter.channel.all"),
    key: -1,
  };
  const channelChoices: ChannelDropdownOption[] = [
    allChannelsChoice,
    ...channels,
  ];

  let selectedChannelOption: ChannelDropdownOption | undefined = {
    ...allChannelsChoice,
  };
  if (selectedChannel && selectedFrom === "filter") {
    selectedChannelOption = channels.find(
      (ch) =>
        ch.value.includes(selectedChannel) &&
        (selectedChannelId ? selectedChannelId === ch.instanceId : true)
    );
  }

  useEffect(() => {
    if (selectedChannel && !selectedChannelOption) {
      loginDispatch({
        type: "INBOX.MESSAGE_FILTER.UPDATED",
        channelName: "ALL",
        channelId: undefined,
        mode: "filter",
      });
    }
  }, [profileId, JSON.stringify([selectedChannel, selectedChannelOption])]);

  if (!selectedChannelOption) {
    return null;
  }

  const selectChannel = (channel: ChannelDropdownOption) => async () => {
    const channelName = aliasChannelName(channel.value as ChannelType);
    loginDispatch({
      type: "INBOX.MESSAGE_FILTER.UPDATED",
      channelName: channelName,
      channelId: channel.instanceId,
      mode: "filter",
    });
    if (
      ["whatsapp", "twilio_whatsapp"].includes(channel.value.toLowerCase()) &&
      channel.instanceId !== instanceId
    ) {
      await post(
        POST_COMPANY_WHATSAPP_CHATAPI_ASSIGN_INSTANCE.replace(
          "{id}",
          profileId
        ),
        { param: { instanceId: channel.instanceId } }
      );
      flash(t("flash.profile.channel.updated"));
      loginDispatch({ type: "INBOX.WHATSAPP_TEMPLATE.RESET" });
    } else if (
      channel.value === "whatsapp360dialog" &&
      channel.instanceId !== instanceId &&
      channel.instanceId !== `${channelId}`
    ) {
      await post(POST_360DIALOG_CHANGE_CHANNEL, {
        param: {
          configId: Number(channel.instanceId),
          userProfileId: profileId,
        },
      });
      flash(t("flash.profile.channel.updated"));
      loginDispatch({ type: "INBOX.WHATSAPP_TEMPLATE.RESET" });
    }

    loginDispatch({
      type: "UPDATE_CHAT_CHANNEL",
      selectedChannelFromConversation: channelName,
      selectedChannelIdFromConversation: channel.instanceId,
    });
  };

  return (
    <Dropdown
      selectOnBlur={false}
      upward={false}
      className={`channels-dropdown ${headerDropdownStyles.dropdown} `}
      trigger={
        <SelectedDropdownWithImage
          image={selectedChannelOption.img}
          imageNode={
            selectedChannelOption.value === "ALL" ? (
              <i className={"ui icon filter-channels-all"} />
            ) : undefined
          }
          text={selectedChannelOption.text}
          adaptive
        />
      }
      scrolling
      value={wrapOptionToString(selectedChannelOption)}
    >
      <Dropdown.Menu>
        <div className={headerDropdownStyles.header}>
          {t("chat.filter.messages.channel")}
        </div>
        {channelChoices.map((channel, i) => {
          const img = channel.img;
          const { instanceId, ...dropdownFields } = channel;
          return (
            <Dropdown.Item
              {...dropdownFields}
              image={null}
              key={`${instanceId}_${i}`}
              content={
                <div key={i} title={htmlEscape(channel.text)}>
                  <span className={headerDropdownStyles.pic}>
                    {img && <Image src={img} alt={channel.text} />}
                    {channel.value === "ALL" && (
                      <i className={"ui icon filter-channels-all"} />
                    )}
                  </span>
                  <span className={"text-label"}>{channel.text}</span>
                </div>
              }
              onClick={selectChannel(channel)}
            />
          );
        })}
      </Dropdown.Menu>
    </Dropdown>
  );
}
