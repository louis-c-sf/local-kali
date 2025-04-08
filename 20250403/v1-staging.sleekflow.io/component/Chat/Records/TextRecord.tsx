import React, { useState } from "react";
import MessageType, { isReactionMessage } from "../../../types/MessageType";
import MessageRecord from "./MessageRecord";
import MessageContent, { isTemplateContentType } from "./MessageContent";
import ReplyInstagramStoryRecord from "./ReplyInstagramStory/ReplyInstagramStoryRecord";
import {
  HeaderFormatEnum,
  WhatsappTemplateComponentButtonType,
} from "../../../types/WhatsappTemplateResponseType";
import useWhatsAppTemplateConvertor from "./useWhatsAppTemplateConvertor";
import { UnsupportedMessage } from "./UnsupportedMessage";
import { useProfileDisplayName } from "../utils/useProfileDisplayName";
import { isObject } from "lodash-es";
import { WhatsappQuickReplyRecord } from "component/Chat/Records/MessageRecord/WhatsappQuickReplyRecord";
import { MessageRecordCommonProps } from "component/Chat/Records/MessageRecord/MessageRecordBase";

export interface TemplateContentType {
  content: string;
  buttons?: Array<WhatsappTemplateComponentButtonType>;
  header?: TemplateContentHeaderType;
  footer?: string;
}

export interface TemplateContentHeaderType {
  content: string;
  filename?: string;
  format: HeaderFormatEnum;
}

export default TextRecord;

function TextRecord(
  props: MessageRecordCommonProps & {
    messageQuoted?: MessageType;
    parentRef?: HTMLDivElement;
    onClick?: () => void;
    parentHeight: number;
    userId: string;
    pickingMessagesActive: boolean;
    isDemo?: boolean;
  }
) {
  const {
    message,
    profile,
    parentHeight,
    t,
    userId,
    pickingMessagesActive,
    senderName,
    isDemo = false,
  } = props;
  const [isReadMore, setIsReadMore] = useState(false);
  const { profileDisplayName } = useProfileDisplayName();

  const supportsReadMore = message.channel === "email";
  const isDisplayReadMore = !isReadMore && supportsReadMore;
  const onClickReadMore = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsReadMore(true);
  };
  const checkReactionMessageType = (message: MessageType) => {
    const name = profile
      ? profileDisplayName(profile)
      : message.sender.whatsappUserDisplayName;
    return message.messageContent
      ? `${t("chat.message.reaction.add", {
          name,
        })}${message.messageContent}`
      : {
          content: t("chat.message.reaction.remove", {
            name,
          }),
        };
  };
  const messageContent = useWhatsAppTemplateConvertor(message);
  const messagePayloadBody =
    message.channel === "whatsappcloudapi" && isReactionMessage(message)
      ? checkReactionMessageType(message)
      : messageContent.content;
  const unsupportedMessageContent = "<Unsupported Message Type>";
  const unsupportedMessageChildren =
    isTemplateContentType(messagePayloadBody) &&
    messagePayloadBody.content === unsupportedMessageContent ? (
      <UnsupportedMessage />
    ) : undefined;

  let buttons: WhatsappTemplateComponentButtonType[] = [];
  if (messageContent.content && isObject(messageContent.content)) {
    buttons = [...(messageContent.content.buttons ?? [])];
  }

  const messageContentRendered = (
    <MessageContent
      sender={message.sender}
      message={messagePayloadBody ?? ""}
      children={unsupportedMessageChildren}
    />
  );

  if (buttons.length > 0) {
    return (
      <WhatsappQuickReplyRecord
        message={message}
        senderName={senderName}
        senderPic={props.senderPic}
        isShowIcon={props.isShowIcon}
        channelTitle={props.channelTitle}
        channelTypeName={props.channelTypeName}
        t={t}
        buttons={buttons}
        messageClasses={[]}
        disabledHover={isDemo}
        onHeightChange={supportsReadMore ? setIsReadMore : undefined}
        parentHeight={supportsReadMore ? parentHeight : undefined}
        profile={profile}
        userId={props.userId}
        pickingMessagesActive={props.pickingMessagesActive}
        beforeContent={props.beforeContent}
      >
        {messageContentRendered}
      </WhatsappQuickReplyRecord>
    );
  }

  return message.storyURL ? (
    <ReplyInstagramStoryRecord
      t={t}
      channelTitle={props.channelTitle}
      channelTypeName={props.channelTypeName}
      profile={profile}
      message={message}
      userId={userId}
      pickingMessagesActive={pickingMessagesActive}
      isShowIcon={props.isShowIcon}
      senderName={senderName}
      senderPic={props.senderPic}
      beforeContent={props.beforeContent}
    />
  ) : (
    <MessageRecord
      disabledHover={isDemo}
      profile={profile}
      message={message}
      senderPic={props.senderPic}
      isShowIcon={props.isShowIcon}
      messageQuoted={props.messageQuoted}
      beforeContent={props.beforeContent}
      contentStyle={{
        height: isDisplayReadMore ? parentHeight : "auto",
      }}
      messageClasses={
        isTemplateContentType(messagePayloadBody) &&
        messagePayloadBody.header &&
        messagePayloadBody.header.format !== HeaderFormatEnum.TEXT
          ? ["image"]
          : undefined
      }
      contentClasses={
        isDisplayReadMore
          ? ["read-more"]
          : isTemplateContentType(messagePayloadBody) &&
            messagePayloadBody.header &&
            messagePayloadBody.header.format !== HeaderFormatEnum.TEXT
          ? ["image"]
          : undefined
      }
      afterContent={
        isDisplayReadMore ? (
          <div className="read-more link3" onClick={onClickReadMore}>
            {t("chat.message.readMore")}
          </div>
        ) : null
      }
      channelTitle={props.channelTitle}
      channelTypeName={props.channelTypeName}
      onHeightChange={supportsReadMore ? setIsReadMore : undefined}
      parentHeight={supportsReadMore ? parentHeight : undefined}
      t={t}
      userId={userId}
      pickingMessagesActive={pickingMessagesActive}
      senderName={senderName}
    >
      <div className={"message-content"}>{messageContentRendered}</div>
    </MessageRecord>
  );
}
