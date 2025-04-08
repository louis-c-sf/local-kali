import MessageType, {
  isTextMessage,
  isAttachmentMessage,
  isAudioMessage,
  isInteractiveMessage,
  isFacebookOTNRequestMessage,
  isReactionMessage,
  isFacebookAdClickedMessage,
  isWhatsappAdClickedMessage,
} from "../../../types/MessageType";
import { ProfileType } from "types/LoginType";
import { TFunction } from "i18next";
import { useChatGuard } from "../hooks/Labels/useChatGuard";
import React, { useState, useEffect, ReactNode, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "AppRootContext";
import { debounce } from "lodash-es";
import { Checkbox } from "semantic-ui-react";
import TextRecord from "./TextRecord";
import { AudioRecordProxy } from "./AudioRecordProxy";
import AudioRecord from "./AudioRecord";
import FileRecord from "./FileRecord";
import { CheckboxProps } from "semantic-ui-react/dist/commonjs/modules/Checkbox/Checkbox";
import { PaymentRecord } from "./MessageRecord/PaymentRecord";
import InteractiveMessageRecord from "./InteractiveMessageRecord";
import { isPaymentMessage } from "core/models/Ecommerce/Payment/IsPaymentMessage";
import { CartRecord } from "component/Chat/Records/MessageRecord/CartRecord";
import {
  isWhatsappCartMessage,
  CartMessageType,
} from "core/models/Ecommerce/Inbox/CartMessageType";
import { getSenderProfilePic } from "component/Chat/Records/MessageRecord";

import { FacebookAdMessage } from "component/Chat/Records/MessageRecord/Prepend/FacebookAdMessage";

import { WhatsappAdMessage } from "component/Chat/Records/MessageRecord/Prepend/WhatsappAdMessage";

export function getMessageNodeId(m: MessageType) {
  return m.messageChecksum || m.id;
}

export function CheckableRow(props: {
  active: boolean;
  checked: boolean;
  onToggle: (message: MessageType, selected: boolean) => void;
  message: MessageType;
  isShowIcon: boolean;
  senderName: string;
  containerNode: HTMLDivElement | null;
  profile: ProfileType;
  messageQuoted?: MessageType;
  channelTitle: string;
  channelTypeName: string;
  audioPlayingId?: string;
  startAudioId?: string;
  t: TFunction;
  userId: string;
  pickingMessagesActive: boolean;
}) {
  const {
    active,
    checked,
    onToggle,
    message,
    isShowIcon,
    messageQuoted,
    profile,
    containerNode,
    userId,
    pickingMessagesActive,
    senderName,
    t,
  } = props;
  const chatGuard = useChatGuard();
  const [parentHeight, setParentHeight] = useState(0);
  const loginDispatch = useAppDispatch();

  const senderPic = useAppSelector((s) =>
    getSenderProfilePic(props.message, s.staffList)
  );

  useEffect(() => {
    if (!containerNode) {
      return;
    }
    const resizeHandler = debounce(() => {
      if (containerNode?.parentElement?.offsetHeight) {
        setParentHeight(containerNode.parentElement.offsetHeight - 110);
      }
    }, 100);

    window.addEventListener("resize", resizeHandler);

    return () => {
      window.removeEventListener("resize", resizeHandler);
    };
  }, [containerNode]);

  let contents: ReactNode;
  let extraContents: ReactNode = null;

  if (isFacebookAdClickedMessage(message)) {
    const payload =
      message.extendedMessagePayload?.extendedMessagePayloadDetail
        .facebookAdClickToMessengerObject;

    if (payload) {
      extraContents = (
        <FacebookAdMessage
          t={t}
          payload={payload}
          userId={userId}
          pickingMessagesActive={pickingMessagesActive}
        />
      );
    }
  } else if (isWhatsappAdClickedMessage(message)) {
    const whatsappPayload =
      message.extendedMessagePayload.extendedMessagePayloadDetail
        .whatsappCloudApiReferral;
    extraContents = <WhatsappAdMessage t={t} payload={whatsappPayload} />;
  }

  const paymentExists = message.sleekPayRecord ?? message.sleekPayRecordProxy;

  switch (true) {
    case isInteractiveMessage(message):
    case isFacebookOTNRequestMessage(message):
      contents = (
        <InteractiveMessageRecord
          isShowIcon={isShowIcon}
          message={message}
          profile={profile}
          messageQuoted={messageQuoted}
          key={message.messageUniqueID ?? message.messageChecksum}
          channelTitle={props.channelTitle}
          channelTypeName={props.channelTypeName}
          t={t}
          userId={userId}
          senderName={senderName}
          senderPic={senderPic}
          beforeContent={extraContents}
        />
      );
      break;

    case isAttachmentMessage(message) &&
      isAudioMessage(message) &&
      message.status.toLowerCase() === "sending":
      contents = (
        <AudioRecordProxy
          message={message}
          isShowIcon={isShowIcon}
          profile={profile}
          channelTitle={props.channelTitle}
          channelTypeName={props.channelTypeName}
          t={t}
          userId={userId}
          pickingMessagesActive={pickingMessagesActive}
          senderName={senderName}
          senderPic={senderPic}
          beforeContent={extraContents}
        />
      );
      break;

    case isAttachmentMessage(message) &&
      isAudioMessage(message) &&
      message.status.toLowerCase() !== "sending":
      contents = (
        <AudioRecord
          profile={profile}
          message={message}
          isShowIcon={isShowIcon}
          onStart={(id) => {
            loginDispatch({ type: "CHAT_AUDIO_STARTED", id });
          }}
          onStop={(id) => {
            loginDispatch({ type: "CHAT_AUDIO_STARTED", id });
          }}
          onFinish={(id) => {
            loginDispatch({ type: "CHAT_AUDIO_FINISHED", id });
          }}
          currentlyPlayingId={props.audioPlayingId}
          startAudioId={props.startAudioId}
          channelTitle={props.channelTitle}
          channelTypeName={props.channelTypeName}
          t={t}
          userId={userId}
          pickingMessagesActive={pickingMessagesActive}
          senderName={senderName}
          senderPic={senderPic}
          beforeContent={extraContents}
        />
      );
      break;

    case isAttachmentMessage(message) && !isAudioMessage(message):
      contents = (
        <FileRecord
          isShowIcon={isShowIcon}
          displayTimeFormat={""}
          message={message}
          profile={profile}
          channelTitle={props.channelTitle}
          channelTypeName={props.channelTypeName}
          t={t}
          userId={userId}
          pickingMessagesActive={pickingMessagesActive}
          senderName={senderName}
          senderPic={senderPic}
          messageQuoted={props.messageQuoted}
          beforeContent={extraContents}
        />
      );
      break;

    case isPaymentMessage(message) && Boolean(paymentExists):
      contents = (
        <PaymentRecord
          payment={paymentExists!}
          isShowIcon={isShowIcon}
          message={message}
          profile={profile}
          channelTitle={props.channelTitle}
          channelTypeName={props.channelTypeName}
          t={t}
          userId={userId}
          pickingMessagesActive={pickingMessagesActive}
          senderName={senderName}
          senderPic={senderPic}
          messageQuoted={props.messageQuoted}
          beforeContent={extraContents}
        />
      );
      break;

    case isWhatsappCartMessage(message):
      contents = (
        <CartRecord
          isShowIcon={isShowIcon}
          message={message as CartMessageType}
          profile={profile}
          channelTitle={props.channelTitle}
          channelTypeName={props.channelTypeName}
          t={t}
          userId={userId}
          pickingMessagesActive={pickingMessagesActive}
          senderName={senderName}
          senderPic={senderPic}
          beforeContent={extraContents}
        />
      );
      break;

    case isTextMessage(message):
    case isReactionMessage(message):
      contents = (
        <TextRecord
          isShowIcon={isShowIcon}
          message={message}
          profile={profile}
          messageQuoted={messageQuoted}
          key={message.messageUniqueID ?? message.messageChecksum}
          channelTitle={props.channelTitle}
          channelTypeName={props.channelTypeName}
          parentHeight={parentHeight}
          t={t}
          userId={userId}
          pickingMessagesActive={pickingMessagesActive}
          senderName={senderName}
          senderPic={senderPic}
          beforeContent={extraContents}
        />
      );
      break;

    default:
      contents = (
        <TextRecord
          isShowIcon={isShowIcon}
          message={message}
          profile={profile}
          messageQuoted={messageQuoted}
          key={message.messageUniqueID ?? message.messageChecksum}
          channelTitle={props.channelTitle}
          channelTypeName={props.channelTypeName}
          parentHeight={parentHeight}
          t={t}
          userId={userId}
          pickingMessagesActive={pickingMessagesActive}
          senderName={senderName}
          senderPic={senderPic}
          beforeContent={extraContents}
        />
      );
      break;
  }

  const toggleChecked = useCallback(
    (event: React.MouseEvent<HTMLInputElement>, data: CheckboxProps) => {
      onToggle(message, !!data.checked);
    },
    [onToggle]
  );

  return (
    <div
      className={`checkable-row ${checked ? "checked" : ""}`}
      data-message-id={getMessageNodeId(message)}
    >
      {active && chatGuard.canPickMessage(message) && (
        <Checkbox checked={checked} onClick={toggleChecked} />
      )}
      {contents}
    </div>
  );
}
