import React from "react";
import { Image } from "semantic-ui-react";
import BroadcastChannelWarningIcon from "./BroadcastChannelWarningIcon";
import styles from "./BroadcastChannel.module.css";
export default function BroadcastChannel(props: {
  updatedSelectedChannel: () => void;
  isSelected: boolean;
  index: number;
  isError: Boolean;
  channelName: string;
  iconFactory: string | undefined;
}) {
  const {
    updatedSelectedChannel,
    isSelected,
    index,
    isError,
    channelName,
    iconFactory,
  } = props;
  return (
    <div
      key={index}
      onClick={updatedSelectedChannel}
      className={styles.channel}
    >
      {iconFactory && <Image className={styles.icon} src={iconFactory} />}
      <span className={`${styles.name} ${isSelected ? styles.selected : ""}`}>
        {channelName}
      </span>
      {isError && (
        <BroadcastChannelWarningIcon className={styles.warningIcon} />
      )}
    </div>
  );
}
