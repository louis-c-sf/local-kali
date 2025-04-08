import MessageType, {
  isAttachmentMessage,
  isInteractiveMessage,
  isFacebookOTNRequestMessage,
  isStaffMessage,
  isTextMessage,
  isReactionMessage,
} from "../../../types/MessageType";
import React, { useEffect, useCallback } from "react";
import { replaceMentions } from "../utils/replaceMentions";
import { propEq, equals } from "ramda";
import useCompanyChannels from "../hooks/useCompanyChannels";
import { TargetedChannelType } from "types/BroadcastCampaignType";
import { ChannelType } from "../Messenger/types";
import { useChatChannelLocales } from "../localizable/useChatChannelLocales";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "AppRootContext";
import { CheckableRow } from "./CheckableRow";
import { useProfileDisplayName } from "../utils/useProfileDisplayName";
import { isPaymentMessage } from "core/models/Ecommerce/Payment/IsPaymentMessage";
import { isAnyWhatsappChannel } from "core/models/Channel/isAnyWhatsappChannel";
import { isWhatsappCartMessage } from "core/models/Ecommerce/Inbox/CartMessageType";

interface SamePersonChecking {
  [key: string]: string;
}

const ScrollContents = (props: {
  messages: MessageType[];
  containerNode: HTMLDivElement | null;
}) => {
  const { containerNode } = props;
  const audioPlayingId = useAppSelector((s) => s.inbox.audioPlayingId);
  const startAudioId = useAppSelector((s) => s.inbox.startAudioId);
  const pickedIds = useAppSelector(
    (s) => s.inbox.pickingMessages.pickedIds,
    equals
  );
  const users = useAppSelector(
    (s) => s.staffList.map((staff) => staff.userInfo),
    equals
  );
  const userId = useAppSelector((s) => s.user?.id);
  const profile = useAppSelector((s) => s.profile, equals);

  const pickingMessagesActive = useAppSelector(
    (s) => s.inbox.pickingMessages.active
  );
  const { t } = useTranslation();
  const loginDispatch = useAppDispatch();
  const companyChannels = useCompanyChannels();
  const { channelNameDisplay, toChannelNames } = useChatChannelLocales();
  const { getPicText, getSenderName } = useProfileDisplayName();

  useEffect(() => {
    if (!containerNode) {
      return;
    }
    const notesRaw =
      containerNode.querySelectorAll(
        ".message.note .message-content-transformed"
      ) || [];
    Array.from(notesRaw)
      .filter(
        (node: Element) => node.attributes["data-mentions-highlight"] !== "on"
      )
      .forEach((node: Element) => {
        node.innerHTML = replaceMentions(node.innerHTML, users, true);
        node.attributes["data-mentions-highlight"] = "on";
      });
  }, [containerNode, users]);

  const handleCheckRow = useCallback(
    (message: MessageType, checked: boolean) => {
      if (checked) {
        loginDispatch({
          type: "INBOX.MESSAGE.PICKED",
          messageId: message.id,
        });
      } else {
        loginDispatch({
          type: "INBOX.MESSAGE.UNPICKED",
          messageId: message.id,
        });
      }
    },
    [loginDispatch]
  );

  let isSamePerson: SamePersonChecking = {
    staff: "",
    client: "",
  };

  return (
    <div className={"chatsScroll"}>
      {props.messages.map((message) => {
        let messageQuoted: MessageType | undefined;
        if (message.quotedMsgId) {
          const quoteFound = props.messages.find(
            propEq("messageUniqueID", message.quotedMsgId)
          );
          if (quoteFound) {
            messageQuoted = quoteFound;
          }
        }
        const isStaff = isStaffMessage(message);
        const staffName = message.sender?.userName || "staff";
        const clientName = `${message.sender?.name} ${message.sender?.phone_number}`;
        const isSamePersonKey = isStaff ? staffName : clientName;
        if (isSamePerson[isSamePersonKey] === undefined) {
          isSamePerson[isSamePersonKey] = "";
        }

        const others = Object.keys(isSamePerson).filter(
          (key) => key !== isSamePersonKey
        );
        others.forEach((other) => {
          isSamePerson[other] = "";
        });
        const isShowIcon = isSamePerson[isSamePersonKey] === "";
        isSamePerson[isSamePersonKey] =
          (isSamePerson[isSamePersonKey] && "") || "displayed";
        isSamePerson[isSamePersonKey === staffName ? clientName : staffName] =
          "";

        const rowChecked = pickedIds.includes(message.id);

        if (
          !message ||
          !(
            isTextMessage(message) ||
            isReactionMessage(message) ||
            isAttachmentMessage(message) ||
            isPaymentMessage(message) ||
            isInteractiveMessage(message) ||
            isWhatsappCartMessage(message) ||
            isFacebookOTNRequestMessage(message)
          )
        ) {
          return null;
        }
        let channelName: string = "";
        if (!"note".includes(message.channel)) {
          let channelId = getMessageChannelId(message);
          const targetedChannel: TargetedChannelType = {
            channel: message.channel as ChannelType,
            ids: channelId ? [String(channelId)] : [],
          };
          [channelName] = [targetedChannel].reduce(
            toChannelNames(companyChannels),
            []
          );
        }
        return (
          <CheckableRow
            key={message.messageChecksum ?? message.id}
            checked={rowChecked}
            active={pickingMessagesActive}
            onToggle={handleCheckRow}
            message={message}
            isShowIcon={isShowIcon}
            containerNode={containerNode}
            profile={profile}
            messageQuoted={messageQuoted}
            channelTitle={channelName}
            channelTypeName={
              message.isSandbox
                ? channelNameDisplay["sandbox"]
                : channelNameDisplay[message.channel] ?? ""
            }
            audioPlayingId={audioPlayingId ?? undefined}
            startAudioId={startAudioId ?? undefined}
            t={t}
            userId={userId}
            pickingMessagesActive={pickingMessagesActive}
            senderName={
              getSenderName(message, profile) || getPicText(profile, message)
            }
          />
        );
      })}
    </div>
  );
};

export const ScrollContentsMemo = React.memo(
  ScrollContents,
  (prevProps, nextProps) => {
    return (
      equals(prevProps.messages, nextProps.messages) &&
      prevProps.containerNode === nextProps.containerNode
    );
  }
);

export function getMessageIdentifyId(message: MessageType) {
  switch (message.channel) {
    case "instagram":
      return message.receiver?.instagramPageId || message.senderId || "";
    case "telegram":
      return (
        message.receiver?.telegramBotId || message.sender?.telegramBotId || ""
      );
    case "facebook":
      return message.receiver?.pageId || "";
    default:
      return message.senderId || "";
  }
}

export function getMessageChannelId(message: MessageType): string | undefined {
  const channelId = isAnyWhatsappChannel(message.channel)
    ? message.receiver?.instanceId ||
      message.receiver?.channelId ||
      message.sender?.channelId ||
      message.whatsappCloudApiSender?.whatsappChannelPhoneNumber ||
      message.whatsappCloudApiReceiver?.whatsappChannelPhoneNumber ||
      ""
    : getMessageIdentifyId(message);

  return channelId;
}
