import React, { ReactNode, useCallback, useState } from "react";
import styles from "./MessageRecord.module.css";
import MessageType, {
  isDeletedMessage,
  isFacebookOTNRequestMessage,
  isStaffMessage,
} from "../../../types/MessageType";
import { ContextMenu } from "./ContextMenu";
import { MessageQuoted } from "../Messenger/MessageQuoted";
import { Icon } from "semantic-ui-react";
import { useAppDispatch } from "../../../AppRootContext";
import { URL } from "../../../api/apiRequest";
import { GET_COMPANY_STAFF_PIC } from "../../../api/apiPath";
import { StaffType } from "../../../types/StaffType";
import {
  MessageRecordBase,
  MessageRecordBaseProps,
} from "component/Chat/Records/MessageRecord/MessageRecordBase";

export function getSenderProfilePic(
  message: MessageType,
  staffList: StaffType[]
) {
  let pic = "";
  const channelType = message.channel;
  if (channelType === "wechat") {
    pic = message.sender?.headimgurl;
  }
  if (channelType === "facebook" || channelType === "whatsapp") {
    pic = message.sender?.profile_pic;
  }
  if (channelType === "line") {
    pic = message.sender?.pictureUrl;
  }

  if (isStaffMessage(message)) {
    if (staffList) {
      const foundStaff = staffList.find(
        (staff) => staff.userInfo.userName === message.sender?.userName
      );
      if (foundStaff?.profilePicture) {
        return `${URL}${GET_COMPANY_STAFF_PIC}/${foundStaff.profilePicture.profilePictureId}`;
      }
    }
  }

  return pic ?? "";
}

export default function MessageRecord(
  props: MessageRecordBaseProps & {
    children: ReactNode;
    messageQuoted?: MessageType;
    contentStyle?: React.CSSProperties;
    contentClasses?: string[];
    afterContent?: ReactNode;
    userId: string;
    pickingMessagesActive: boolean;
  }
) {
  const {
    profile,
    message,
    isShowIcon,
    channelTitle,
    channelTypeName,
    parentHeight,
    setContentHeight,
    t,
    pickingMessagesActive,
    userId,
    senderName,
    senderPic,
    messageClasses = [],
    disabledHover = false,
  } = props;
  const [hovered, setHovered] = useState(false);
  const [contentElement, setContentElement] = useState<HTMLDivElement | null>(
    null
  );
  const loginDispatch = useAppDispatch();

  const contentClasses = [];
  message.isSelected && contentClasses.push("highlight");
  contentClasses.push(...(props.contentClasses ?? []));
  const handleQuotedMessageClick = useCallback(
    (message?: MessageType) => {
      if (!message) {
        return;
      }
      loginDispatch({
        type: "INBOX.MESSAGE.SEARCH_RESULT_CLICK",
        message,
      });
    },
    [loginDispatch]
  );
  return (
    <MessageRecordBase
      contentElement={contentElement}
      setHovered={setHovered}
      senderPic={senderPic}
      channelTitle={channelTitle}
      channelTypeName={channelTypeName}
      isShowIcon={isShowIcon}
      message={message}
      senderName={senderName}
      t={t}
      disabledHover={disabledHover}
      messageClasses={messageClasses}
      onHeightChange={props.onHeightChange}
      parentHeight={parentHeight}
      profile={profile}
      setContentHeight={setContentHeight}
      beforeContent={props.beforeContent}
    >
      <div
        className={`content ${contentClasses.join(" ")}`}
        ref={setContentElement}
        style={props.contentStyle}
      >
        {(props.messageQuoted || message.quotedMsgBody) && (
          <MessageQuoted
            onClick={handleQuotedMessageClick}
            message={props.messageQuoted || message.quotedMsgBody}
          />
        )}
        {props.beforeContent && (
          <div className={styles.prepend}>{props.beforeContent}</div>
        )}
        {props.children}
        {isDeletedMessage(message) && (
          <div className={"deleted-remark"}>
            <Icon name={"ban"} />
            {message.sender.id === userId
              ? t("chat.message.deleted.you")
              : t("chat.message.deleted.deleted")}
          </div>
        )}
        {!isFacebookOTNRequestMessage(message) &&
          !pickingMessagesActive &&
          hovered && <ContextMenu message={message} showTrigger />}
      </div>
      {props.afterContent}
    </MessageRecordBase>
  );
}
