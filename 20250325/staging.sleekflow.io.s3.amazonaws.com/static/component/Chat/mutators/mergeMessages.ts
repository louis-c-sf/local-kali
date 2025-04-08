import { ProfileType } from "../../../types/LoginType";
import MessageType from "../../../types/MessageType";
import { pipe } from "ramda";
import { sortedFromOldest } from "./sortedFromOldest";

export type ChatsMergeUpdateType = {
  chats?: ProfileType[];
  messages?: MessageType[];
};

export function clearIsSelected(targetMessages: MessageType[]): MessageType[] {
  return targetMessages.map((targetMessage) => {
    return {
      ...targetMessage,
      isSelected: false,
    };
  });
}

export function mergeMessages(
  target: MessageType[],
  sourceMessages: MessageType[]
): MessageType[] {
  if (target.length === 0) {
    // just insert everything into empty chat
    return sortedFromOldest(sourceMessages);
  }
  const transform = pipe(
    mergeExistingMessages(sourceMessages),
    mergeNewMessages(sourceMessages),
    replaceProxies,
    sortedFromOldest
  );

  return transform(target);
}

function mergeNewMessages(allSourceMessages: MessageType[]) {
  return (target: MessageType[]): MessageType[] =>
    target.concat(allSourceMessages.filter(notInList(target)));
}

function mergeExistingMessages(allSourceMessages: MessageType[]) {
  return (targetMessages: MessageType[]): MessageType[] =>
    allSourceMessages
      .filter(inList(targetMessages))
      .filter((m) => !isProxyMessage(m))
      .reduce(updateExistingMessage, targetMessages);
}

export function isProxyMessage(message: MessageType): boolean {
  return message.status?.toLowerCase() === "sending";
}

function replaceProxies(messages: MessageType[]): MessageType[] {
  return messages.reduce<MessageType[]>((acc, message) => {
    if (!acc.some(matchingMessage(message))) {
      if (!isProxyMessage(message)) {
        acc.push({ ...message });
      } else {
        const nonProxyFound = messages.find(
          (m) => !isProxyMessage(m) && matchingMessage(message)(m)
        );
        if (!nonProxyFound) {
          acc.push({ ...message });
        } else {
          acc.push({ ...nonProxyFound });
        }
      }
    }
    return acc;
  }, []);
}

function updateExistingMessage(
  targetMessages: MessageType[],
  nextMessage: MessageType
): MessageType[] {
  const targetMessageIndex = targetMessages.findIndex(
    matchingMessage(nextMessage)
  );
  if (targetMessageIndex > -1) {
    targetMessages[targetMessageIndex] = {
      ...targetMessages[targetMessageIndex],
      ...nextMessage,
      status: checkMessageStatus(
        targetMessages[targetMessageIndex].status,
        nextMessage.status
      ),
    };
  }
  return targetMessages;
}

export function notInList(list: MessageType[]) {
  return (message: MessageType) => !list.some(matchingMessage(message));
}

function inList(list: MessageType[]) {
  return (message: MessageType) => list.some(matchingMessage(message));
}

export function matchingMessage(testMessage: MessageType) {
  return (chatMessage: MessageType): boolean => {
    if (chatMessage.messageChecksum && testMessage.messageChecksum) {
      // message id might be set in SendMessageBox on sending a new message
      return chatMessage.messageChecksum === testMessage.messageChecksum;
    } else if (Boolean(testMessage.id)) {
      return chatMessage.id === testMessage.id;
    } else if (
      Boolean(testMessage.messageContent) &&
      Boolean(testMessage.senderId)
    ) {
      return (
        testMessage.messageContent === chatMessage.messageContent &&
        testMessage.senderId === chatMessage.senderId
      );
    }
    // leave possible duplicate just for case
    return false;
  };
}

function checkMessageStatus(currentStatus: string, nextStatus: string): string {
  const lowerCaseNextStatus = nextStatus.toLowerCase();
  switch (currentStatus.toLowerCase()) {
    case "sending":
    case "scheduled":
      return ["sent", "read", "received", "failed", "undelivered"].includes(
        lowerCaseNextStatus
      )
        ? nextStatus
        : currentStatus;
    case "sent":
    case "scheduled":
      return ["read", "received", "failed", "undelivered"].includes(
        lowerCaseNextStatus
      )
        ? nextStatus
        : currentStatus;
    case "received":
      return ["deleted", "read"].includes(lowerCaseNextStatus)
        ? nextStatus
        : currentStatus;
    default:
      return currentStatus;
  }
}
