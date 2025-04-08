import React from "react";
import MessageType from "../../../types/MessageType";
import { Loader, Progress } from "semantic-ui-react";
import MessageRecord from "./MessageRecord";
import { MessageRecordCommonProps } from "component/Chat/Records/MessageRecord/MessageRecordBase";

export function AudioRecordProxy(
  props: MessageRecordCommonProps & {
    messageQuoted?: MessageType;
    userId: string;
    pickingMessagesActive: boolean;
  }
) {
  const {
    isShowIcon,
    message,
    t,
    userId,
    pickingMessagesActive,
    profile,
    senderName,
    senderPic,
  } = props;

  return (
    <MessageRecord
      message={message}
      senderPic={senderPic}
      messageQuoted={props.messageQuoted}
      isShowIcon={isShowIcon}
      profile={profile}
      messageClasses={["audio"]}
      channelTitle={props.channelTitle}
      channelTypeName={props.channelTypeName}
      t={t}
      userId={userId}
      pickingMessagesActive={pickingMessagesActive}
      senderName={senderName}
      beforeContent={props.beforeContent}
    >
      <div className="player">
        <Loader active size={"tiny"} inline />

        <div className={"progress-wrap"}>
          <Progress active={false} percent={0} disabled />
        </div>
        <span className="time">00:00</span>
      </div>
    </MessageRecord>
  );
}
