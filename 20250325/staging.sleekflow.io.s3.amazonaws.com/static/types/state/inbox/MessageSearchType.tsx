import MessageType from "../../MessageType";

export type ContextMessagesStateType = {
  initialized: boolean;
  list: MessageType[];
  active: boolean;
  loading: boolean;
  hasMoreBefore: boolean;
  hasMoreAfter: boolean;
};

export type MessageSearchType = {
  active: boolean;
  queryLatest?: string;
  query: string;
  results: MessageType[];
  loading: boolean;
  clickedMessage?: MessageType;
  highlightMessage?: MessageType;
  contextMessages: ContextMessagesStateType;
};

export const contextMessagesInit: MessageSearchType["contextMessages"] = {
  list: [],
  initialized: false,
  loading: false,
  active: false,
  hasMoreBefore: true,
  hasMoreAfter: true,
};

export const messageSearchInit: MessageSearchType = {
  active: false,
  loading: false,
  query: "",
  queryLatest: undefined,
  results: [],
  contextMessages: contextMessagesInit,
  highlightMessage: undefined,
  clickedMessage: undefined,
};
