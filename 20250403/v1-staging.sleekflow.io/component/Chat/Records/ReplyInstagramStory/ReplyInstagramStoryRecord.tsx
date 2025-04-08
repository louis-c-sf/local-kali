import React from "react";
import MessageContent from "../MessageContent";
import MessageRecord from "../MessageRecord";
import Style from "./ReplyInstagramStory.module.css";
import { MessageRecordCommonProps } from "component/Chat/Records/MessageRecord/MessageRecordBase";

export default function ReplyInstagramStoryRecord(
  props: MessageRecordCommonProps & {
    userId: string;
    pickingMessagesActive: boolean;
  }
) {
  const {
    message,
    isShowIcon,
    profile,
    channelTitle,
    channelTypeName,
    t,
    userId,
    pickingMessagesActive,
    senderName,
    senderPic,
  } = props;
  return (
    <MessageRecord
      profile={profile}
      message={message}
      isShowIcon={isShowIcon}
      channelTitle={channelTitle}
      channelTypeName={channelTypeName}
      pickingMessagesActive={pickingMessagesActive}
      userId={userId}
      t={t}
      senderName={senderName}
      senderPic={senderPic}
      beforeContent={null}
    >
      <div className={Style.container}>
        <div className={Style.title}>
          {t("chat.message.instagram.storyReply.title")}:
        </div>
        <div className={Style.replyText}>
          <MessageContent message={message.messageContent} />
        </div>
        <div className={Style.link}>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={message.storyURL ?? ""}
          >
            {t("chat.message.instagram.storyReply.link")}
          </a>
        </div>
      </div>
    </MessageRecord>
  );
}
