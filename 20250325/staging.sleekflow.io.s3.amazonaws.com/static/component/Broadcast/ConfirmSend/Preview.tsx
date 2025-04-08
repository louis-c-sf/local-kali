import React, { useState } from "react";
import styles from "./Preview.module.css";
import { useTranslation } from "react-i18next";
import {
  ChannelMessageType,
  TargetedChannelType,
} from "../../../types/BroadcastCampaignType";
import { PreviewContent } from "../../Settings/SettingTemplates/PreviewContent";
import { equalToTargetedChannel } from "../helpers/equalToTargetedChannel";
import { ChannelsValueDropdown } from "../../shared/ChannelsValueDropdown";
import { ChannelType } from "../../Chat/Messenger/types";
import { useAppSelector } from "../../../AppRootContext";
import { equals } from "ramda";
import { getWhatsappTemplateMatch } from "../validator/useValidateBroadcastForm";
import { isAnyWhatsappChannel } from "core/models/Channel/isAnyWhatsappChannel";

export function Preview(props: {
  channelsAvailable: TargetedChannelType[];
  messages: ChannelMessageType[];
}) {
  const { channelsAvailable, messages } = props;
  const { t, i18n } = useTranslation();
  const whatsappTemplatesCached = useAppSelector(
    (s) => s.inbox.whatsAppTemplates,
    equals
  );
  const [channelSelected, setChannelSelected] = useState<
    TargetedChannelType | undefined
  >(channelsAvailable[0]);
  let messageSelected: ChannelMessageType | undefined;

  if (channelSelected) {
    messageSelected =
      messages.find((m) =>
        m.targetedChannelWithIds.some(equalToTargetedChannel(channelSelected))
      ) ??
      messages.find((m) =>
        m.targetedChannelWithIds.some(
          (ch) => ch.channel === channelSelected.channel
        )
      );
  }

  function getMessageContent(message: ChannelMessageType) {
    if (!messageSelected) {
      return "";
    }
    const isOfficialChannel =
      channelSelected && isAnyWhatsappChannel(channelSelected.channel);
    if (isOfficialChannel && channelSelected) {
      if (message.mode === "type") {
        return messageSelected.content ?? "";
      }
      if (!messageSelected.templateName) {
        return messageSelected.content ?? "";
      }
      const whatsappTemplate = getWhatsappTemplateMatch(
        whatsappTemplatesCached,
        messageSelected.templateName,
        channelSelected.channel,
        messageSelected.templateLanguage ?? i18n.language
      );
      return whatsappTemplate?.content ?? messageSelected?.content ?? "";
    } else {
      return messageSelected.content;
    }
  }

  function getSkin(channel: ChannelType) {
    switch (channel) {
      case "twilio_whatsapp":
      case "whatsapp":
      case "whatsapp360dialog":
      case "whatsappcloudapi":
        return "whatsapp";
      case "line":
        return "line";
      case "sms":
        return "sms";
      case "wechat":
        return "wechat";
      default:
        return "generic";
    }
  }

  const channelsAllowed = [
    "whatsapp",
    "twilio_whatsapp",
    "whatsapp360dialog",
    "line",
    "wechat",
    "sms",
  ];
  const channelsVisible = channelsAllowed.filter((ch) =>
    channelsAvailable.some((cha) => cha.channel === ch)
  );

  return (
    <div className={styles.root}>
      <div className={styles.head}>
        <div className={styles.title}>
          {t("broadcast.edit.reviewModal.preview")}
        </div>
        {channelsAvailable.length > 1 && (
          <div className={styles.channel}>
            <ChannelsValueDropdown
              value={channelSelected ? [channelSelected] : []}
              search={false}
              multiple={false}
              excludeAll={true}
              enabledChannels={channelsVisible}
              onChange={(data) => {
                const [selected] = data;
                setChannelSelected(selected);
              }}
            />
          </div>
        )}
      </div>
      <div className={styles.preview}>
        {messageSelected && channelSelected && (
          <PreviewContent
            compact
            hideHeader
            value={getMessageContent(messageSelected)}
            attachments={messageSelected.uploadedFiles}
            skin={getSkin(channelSelected.channel)}
          />
        )}
      </div>
    </div>
  );
}
