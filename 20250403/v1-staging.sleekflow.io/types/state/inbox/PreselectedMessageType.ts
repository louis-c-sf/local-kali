import {
  ContextMessagesStateType,
  contextMessagesInit,
} from "./MessageSearchType";
import MessageType from "../../MessageType";

export type PreselectedMessageType = {
  messageId: number | null;
  conversationId: string | null;
  highlight: MessageType | null;
  contextMessages: ContextMessagesStateType;
};

export function preselectedMessageDefaults(): PreselectedMessageType {
  return {
    contextMessages: { ...contextMessagesInit },
    conversationId: null,
    messageId: null,
    highlight: null,
  };
}
