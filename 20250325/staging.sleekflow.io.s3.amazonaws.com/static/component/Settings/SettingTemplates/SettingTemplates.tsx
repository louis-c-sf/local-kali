import React, { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import styles from "./SettingTemplates.module.css";
import tableStyles from "../../Contact/Individual/ProfileMediaContent.module.css";
import { BackNavLink } from "../../shared/nav/BackNavLink";
import { iconFactory } from "../../Chat/hooks/useCompanyChannels";
import BroadcastChannel from "../../Broadcast/BroadcastChannel/BroadcastChannel";
import { ChannelTabType, CloudAPIChannelTabType } from "../types/SettingTypes";
import { TargetedChannelType } from "types/BroadcastCampaignType";
import { ChannelLabel } from "component/Broadcast/ConfirmSend/ChannelLabel";

export function isCloudAPIChannelType(
  x: ChannelTabType
): x is CloudAPIChannelTabType {
  return x.isCloudAPI;
}

export default function SettingTemplates(props: {
  backUrl?: string;
  channels: ChannelTabType[];
  onChannelSelected: (channel: ChannelTabType) => void;
  selectedChannel: ChannelTabType | undefined;
  showTabs: boolean;
  children: ReactNode;
}) {
  const {
    channels,
    selectedChannel,
    showTabs,
    backUrl,
    onChannelSelected,
    children,
  } = props;

  const { t } = useTranslation();

  function updateSelectedChannel(channel: ChannelTabType) {
    if (channel.wabaId !== selectedChannel?.wabaId) {
      onChannelSelected(channel);
    }
  }

  const selectedChannelTargeted: TargetedChannelType = {
    channel: selectedChannel?.channelType ?? "whatsapp",
    ids:
      selectedChannel && isCloudAPIChannelType(selectedChannel)
        ? selectedChannel.config.map((c) => c.whatsappPhoneNumber)
        : selectedChannel?.ids?.map((id) => `${id}`),
  };

  return (
    <div
      className={`
        template-management main-primary-column content no-scrollbars
        ${tableStyles.container}
      `}
    >
      <div
        className={selectedChannel?.is360Dialog ? styles.whatsapp360Wrap : ""}
      >
        {backUrl && (
          <div className={styles.navTop}>
            <BackNavLink to={backUrl}>
              {t("settings.templates.backToInbox")}
            </BackNavLink>
          </div>
        )}
        <div className="grid-header">
          <div className="status-text">
            <span className="title">{t("settings.templates.title")}</span>
          </div>
        </div>
        <span className={`sub-title`}>{t("settings.templates.subheader")}</span>
        {showTabs && (
          <>
            <div className={styles.channelTabs}>
              {channels.map((channel, index) => (
                <BroadcastChannel
                  key={`${channel.channel}_${index}`}
                  updatedSelectedChannel={() => updateSelectedChannel(channel)}
                  isSelected={channel.wabaId === selectedChannel?.wabaId}
                  index={index}
                  isError={false}
                  channelName={channel.channel}
                  iconFactory={
                    channel.wabaId && iconFactory("whatsapp360dialog")
                  }
                />
              ))}
            </div>
            {selectedChannel && (
              <div className={styles.channels}>
                <ChannelLabel channel={selectedChannelTargeted} />
              </div>
            )}
          </>
        )}
        {children}
      </div>
    </div>
  );
}
