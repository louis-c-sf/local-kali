import React from "react";
import styles from "./ChannelLabel.module.css";
import { TargetedChannelType } from "../../../types/BroadcastCampaignType";
import { useChatChannelLocales } from "../../Chat/localizable/useChatChannelLocales";
import useCompanyChannels, {
  iconFactory,
} from "../../Chat/hooks/useCompanyChannels";
import { InfoTooltip } from "component/shared/popup/InfoTooltip";

export function ChannelLabel(props: {
  channel: TargetedChannelType;
  singleRow?: boolean;
}) {
  let { channel, singleRow = false } = props;
  const { optionText, optionPhoneNumber } = useChatChannelLocales();
  const channels = useCompanyChannels();
  const channelIds = channel?.ids ?? [];
  const channelOptions = channelIds.map((channelId) => ({
    type: channel.channel,
    id: channelId,
  }));

  return (
    <>
      {channelOptions.map((channelOption) => {
        const text = optionText(channelOption, channels);
        return (
          <InfoTooltip
            placement="bottom"
            hoverable
            offset={[40, 10]}
            trigger={
              <div
                className={`${styles.label} ${
                  singleRow ? styles.singleRow : ""
                }`}
              >
                <div className={styles.icon}>
                  <img src={iconFactory(channel.channel)} />
                </div>
                <div className={styles.text}>{text}</div>
              </div>
            }
          >
            {optionPhoneNumber(channelOption, channels) ?? text}
          </InfoTooltip>
        );
      })}
    </>
  );
}
