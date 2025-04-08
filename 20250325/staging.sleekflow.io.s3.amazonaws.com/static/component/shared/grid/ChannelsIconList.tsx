import React from "react";
import { ChannelConfiguredType } from "../../Chat/Messenger/types";
import { Popup, Image } from "semantic-ui-react";
import { TargetedChannelType } from "../../../types/BroadcastCampaignType";
import { useChatChannelLocales } from "../../Chat/localizable/useChatChannelLocales";
import styles from "./ChannelsIconList.module.css";
import labelStyles from "./../Labels.module.css";

export function ChannelsIconList(props: {
  value: TargetedChannelType[];
  channelsAvailable: ChannelConfiguredType<any>[];
}) {
  const { toChannelTypeWithNames } = useChatChannelLocales();
  const channelNames = props.value.reduce(
    toChannelTypeWithNames(props.channelsAvailable),
    []
  );
  const channelsOutstanding = channelNames.length - 3;

  return (
    <div className={styles.list}>
      {channelNames
        .slice(0, 3)
        .map((channelInfo: ChannelConfiguredType<any>) => {
          return (
            <Popup
              key={`${channelInfo.name}.${JSON.stringify(channelInfo.configs)}`}
              className={`${styles.popup} info-tooltip`}
              content={channelInfo.name}
              trigger={<Image src={channelInfo.image} />}
            />
          );
        })}
      {channelsOutstanding > 0 && (
        <span className={labelStyles.counterLabel}>+{channelsOutstanding}</span>
      )}
    </div>
  );
}
