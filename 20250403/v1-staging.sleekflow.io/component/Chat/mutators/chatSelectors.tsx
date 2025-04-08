import { ProfileType } from "../../../types/LoginType";
import moment from "moment";
import MessageType from "../../../types/MessageType";
import { SearchMessageType } from "../SearchMessageGroupList";
import { messageTime } from "./messageMutators";
import { compose, last, filter } from "ramda";
import {
  ChatMessageDraftType,
  InboxOrderDic,
  InboxOrderDictEnum,
} from "../../../types/state/InboxStateType";
import { sortedFromOldest } from "./sortedFromOldest";

export function matchesConversationId<T extends { conversationId: string }>(
  conversationId: string
) {
  return (t: T) => t.conversationId === conversationId;
}

export function isNoteOrMatchingChannel(name?: string, id?: string) {
  return (t: MessageType) => {
    if (t.channel === "note") {
      return true;
    }
    if (name && ["whatsapp", "twilio_whatsapp"].includes(name)) {
      return (
        t.receiver?.id === id ||
        t.sender?.id === id ||
        t.receiver?.instanceId === id ||
        t.sender?.instance === id
      );
    }
    if (name === "whatsapp360dialog") {
      return (
        t.receiver?.whatsAppId === id ||
        t.sender?.whatsAppId === id ||
        String(t.receiver?.channelId) === id ||
        String(t.sender?.channelId) === id
      );
    }
    if (name === "whatsappcloudapi") {
      return (
        t.whatsappCloudApiSender?.whatsappChannelPhoneNumber === id ||
        t.whatsappCloudApiReceiver?.whatsappChannelPhoneNumber === id
      );
    }
    return name ? t.channel === name : true;
  };
}

export function matchesConversationAndUniqueId(
  conversationId: string,
  messageId: string,
  messageChecksum?: string
) {
  return (chatMessage: MessageType) =>
    chatMessage.conversationId === conversationId &&
    chatMessage.messageChecksum === messageChecksum &&
    chatMessage.messageUniqueID === messageId;
}

export function byLatestMessageCreateDate() {
  return (a: ProfileType, b: ProfileType) => {
    const aConversation = a.conversation?.lastUpdated ?? "";
    const bConversation = b.conversation?.lastUpdated ?? "";
    const bMoment = moment.utc(bConversation, true);
    const aMoment = moment.utc(aConversation, true);
    if (aMoment.isValid() && bMoment.isValid()) {
      return bMoment.diff(aMoment);
    }
    return 0;
  };
}

export function byCustomOrderBy(orderBy: InboxOrderDictEnum) {
  return (a: ProfileType, b: ProfileType) => {
    const aConversation = a.conversation?.lastUpdated ?? "";
    const bConversation = b.conversation?.lastUpdated ?? "";
    const bMoment = moment.utc(bConversation, true);
    const aMoment = moment.utc(aConversation, true);
    if (aMoment.isValid() && bMoment.isValid()) {
      return orderBy === InboxOrderDic.newest
        ? bMoment.diff(aMoment)
        : aMoment.diff(bMoment);
    }
    return 0;
  };
}

export function byMessageCreateDate() {
  return (a: SearchMessageType, b: SearchMessageType) => {
    const bMessageTime = messageTime(b);
    const aMessageTime = messageTime(a);
    if (aMessageTime && bMessageTime) {
      return bMessageTime.diff(aMessageTime);
    }
    return a.matchResult.id - b.matchResult.id;
  };
}

export function bookmarkedFirst(a: ProfileType, b: ProfileType) {
  if (a.isBookmarked) {
    return b.isBookmarked ? 0 : -1;
  }
  return b.isBookmarked ? 1 : 0;
}

export function isUserInvolvedInChat(
  userId: string,
  testChat: ProfileType
): boolean {
  return (
    testChat.assignee?.id === userId ||
    (testChat.collaboratorIds?.includes(userId) ?? false)
  );
}

export function matchesMessageDraft(profileId: string) {
  return (draft: ChatMessageDraftType) => draft.conversationId === profileId;
}

export function getLatestMessage(
  messages: MessageType[]
): MessageType | undefined {
  const getter = compose(last, sortedFromOldest);
  return getter(messages) as MessageType;
}

export function getLatestChatMessage(
  conversationId: string,
  messages: MessageType[]
) {
  const getter = compose(
    last,
    sortedFromOldest,
    filter<MessageType, "array">(matchesConversationId(conversationId))
  );
  return getter(messages);
}
