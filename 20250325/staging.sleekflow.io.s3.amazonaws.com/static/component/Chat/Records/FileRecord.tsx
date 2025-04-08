import React from "react";
import MessageType, {
  isAttachedAudio,
  isAttachedImage,
  isAttachedVideo,
  isAttachedPdf,
} from "../../../types/MessageType";
import MessageRecord from "./MessageRecord";
import AudioFile from "./AudioFile";
import ImageFile from "./FilePreview/ImageFile";
import VideoFile from "./FilePreview/VideoFile";
import PdfFile from "./FilePreview/PdfFile";
import DefaultFile from "./DefaultFile";
import MessageContent from "./MessageContent";
import { MessageRecordCommonProps } from "component/Chat/Records/MessageRecord/MessageRecordBase";

export default FileRecord;

function FileRecord(
  props: MessageRecordCommonProps & {
    messageQuoted?: MessageType;
    displayTimeFormat: string;
    userId: string;
    pickingMessagesActive: boolean;
  }
) {
  const {
    message,
    isShowIcon,
    profile,
    t,
    userId,
    pickingMessagesActive,
    senderName,
    senderPic,
  } = props;
  return (
    <MessageRecord
      message={message}
      senderPic={senderPic}
      messageQuoted={props.messageQuoted}
      isShowIcon={isShowIcon}
      contentClasses={["image"]}
      messageClasses={["image"]}
      profile={profile}
      channelTitle={props.channelTitle}
      channelTypeName={props.channelTypeName}
      t={t}
      userId={userId}
      pickingMessagesActive={pickingMessagesActive}
      senderName={senderName}
      beforeContent={props.beforeContent}
    >
      <>
        {message.uploadedFiles.map((f, index) => {
          const fileKey = `chat_${message.id}_checksum${message.messageChecksum}_file_${f.fileId}_index_${index}`;
          if (isAttachedImage(message, f)) {
            return (
              <ImageFile uploadFile={f} messageId={message.id} key={fileKey} />
            );
          } else if (isAttachedAudio(f)) {
            return <AudioFile uploadFile={f} key={fileKey} />;
          } else if (isAttachedVideo(f)) {
            return (
              <VideoFile uploadFile={f} messageId={message.id} key={fileKey} />
            );
          } else if (isAttachedPdf(f)) {
            return (
              <PdfFile uploadFile={f} messageId={message.id} key={fileKey} />
            );
          } else {
            return <DefaultFile uploadFile={f} key={fileKey} />;
          }
        })}
        {message.messageContent && (
          <div className={`message-content`}>
            <MessageContent message={message.messageContent} />
          </div>
        )}
      </>
    </MessageRecord>
  );
}
