import React, { ReactNode, useEffect } from "react";
import styles from "../MessageRecord.module.css";
import iconStyles from "../../../shared/Icon/Icon.module.css";
import ChatRecordIcon from "../../ChatRecordIcon";
import MessageType, { isStaffMessage } from "types/MessageType";
import { ProfileType } from "types/LoginType";
import { staffDisplayName } from "../../utils/staffDisplayName";
import ChatStatusImage from "../ChatStatusImage";
import { getClientName } from "../getClientName";
import moment from "moment";
import { findClosestParent } from "utility/dom";
import { identical } from "ramda";
import { TFunction } from "i18next";
import { useAppDispatch } from "AppRootContext";
import { useCurrentUtcOffset } from "../../hooks/useCurrentUtcOffset";
import { StaffType } from "types/StaffType";

export type MessageRecordCommonProps = {
  message: MessageType;
  senderName: string;
  senderPic: string | undefined;
  channelTitle: string;
  channelTypeName: string;
  isShowIcon: boolean;
  t: TFunction;
  profile?: ProfileType;
  beforeContent: ReactNode;
};

export type MessageRecordBaseProps = MessageRecordCommonProps & {
  messageClasses?: string[];
  parentHeight?: number;
  onHeightChange?: (overflow: boolean) => void;
  disabledHover?: boolean;
  setContentHeight?: Function;
};

type MessageRecordBaseOwnProps = {
  children: ReactNode;
  setHovered: (hovered: boolean) => void;
  contentElement: HTMLDivElement | null;
};

export function MessageRecordBase(
  props: MessageRecordBaseProps & MessageRecordBaseOwnProps
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
    senderName,
    messageClasses = [],
    disabledHover = false,
    contentElement,
    onHeightChange,
    setHovered,
    senderPic,
  } = props;

  const selectedTimeZone = useCurrentUtcOffset();

  const loginDispatch = useAppDispatch();
  const createdAt = moment.utc(message.scheduleSentAt ?? message.createdAt);
  const timeDiff = createdAt.diff(moment().utc(true), "days");
  const isStaff = isStaffMessage(message);

  function getDisplayDateFormat() {
    switch (true) {
      case message.status.toLowerCase() === "scheduled":
      case timeDiff < 0:
        return "MM/DD HH:mm";
      default:
        return "HH:mm";
    }
  }

  const timestamp = createdAt.utcOffset(selectedTimeZone);
  const displayTimeFormat = timestamp.format(getDisplayDateFormat());

  useEffect(() => {
    if (message.isSelected && contentElement) {
      setTimeout(() => {
        const element = contentElement;
        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 200);
    }
  }, [message.isSelected, contentElement]);

  useEffect(() => {
    if (
      !contentElement ||
      !setContentHeight ||
      parentHeight === undefined ||
      !onHeightChange
    ) {
      return;
    }
    const messageHeight = contentElement.clientHeight;
    if (parentHeight > 0 && messageHeight > parentHeight) {
      onHeightChange(false);
    } else {
      onHeightChange(true);
    }
  }, [contentElement, parentHeight, setContentHeight, onHeightChange]);

  const clientName = getClientName(message, profile);
  const contentClasses = [];
  message.isSelected && contentClasses.push("highlight");
  contentClasses.push(...(contentClasses ?? []));

  return (
    <div
      className={`chatbox ${isStaff ? "staff" : ""}`}
      onMouseOver={() => {
        if (!disabledHover) {
          setHovered(true);
        }
      }}
      onMouseLeave={(ev) => {
        if (!contentElement) {
          return;
        }
        const parent = contentElement as Element;
        if (
          parent &&
          findClosestParent(ev.relatedTarget as HTMLElement, identical(parent))
        ) {
          return;
        }
        setHovered(false);
      }}
    >
      {isShowIcon ? (
        <ChatRecordIcon
          isStaff={isStaff}
          message={message}
          profile={profile}
          pic={senderPic}
          size={32}
        />
      ) : (
        <div className="icon"></div>
      )}
      <div
        className={`
          message
          ${message.channel === "note" ? "note" : ""}
          ${messageClasses.join(" ")}
        `}
      >
        {props.children}
        <div className="info">
          {message.status === "Scheduled" && (
            <i className={`${styles.scheduled} ${iconStyles.icon}`} />
          )}
          <span>{displayTimeFormat}</span>
          <span className="channel-type">{channelTypeName}</span>
          <div className="channel-info">
            {channelTitle && (
              <span className="channel-name">{channelTitle}</span>
            )}
            {isStaff ? (
              <span className="send-message-by">{senderName}</span>
            ) : (
              clientName && (
                <span className="send-message-by">{clientName}</span>
              )
            )}
            {message.messageAssignee && message.messageAssignee.userInfo && (
              <span className="assignee-info">
                @{staffDisplayName(message.messageAssignee as StaffType)}
              </span>
            )}
          </div>
          {isStaff && message.status !== "Scheduled" && (
            <ChatStatusImage
              t={t}
              statusCode={message.channelStatusMessage}
              channel={
                message.channel === "whatsapp" &&
                profile?.whatsAppAccount?.is_twilio
                  ? "twilio_whatsapp"
                  : message.channel
              }
              status={message.status || ""}
              channelStatusMessage={message.channelStatusMessage ?? ""}
            />
          )}
        </div>
      </div>
    </div>
  );
}
