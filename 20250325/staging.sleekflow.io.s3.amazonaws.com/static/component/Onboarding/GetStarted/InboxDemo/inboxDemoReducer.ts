import produce from "immer";

type InboxDemoChatHistoryType = {
  id: number;
  companyId: string;
  demoConversationId: number;
  messageContent: string;
  channel: string;
  isFromUser: boolean;
  createdAt: string;
  updatedAt: string;
};

export type InboxDemoConversationType = {
  staffId: string;
  demoConversationId: string;
  companyId: string;
  status: string;
  assignee: string;
  createdAt: string;
  updatedAt: string;
  unreadMessageCount: number;
  demoUserProfile: {
    firstName: string;
    lastName: string;
    contactOwner: string;
    email: string;
    phoneNumber: string;
    companyName: string;
    role: string;
    companySize: string;
    field: string;
    whatsappUsage: string;
  };
  chatHistory: InboxDemoChatHistoryType[];
};

export type inboxDemoStateType = {
  loading: boolean;
  conversations: InboxDemoConversationType[];
  step: number;
};

export type inboxDemoActionType =
  | {
      type: "CONVERSATION_LOAD_START";
    }
  | {
      type: "CONVERSATION_LOAD_COMPLETE";
      conversations: InboxDemoConversationType[];
    }
  | {
      type: "SEND_CUSTOMER_MESSAGE";
      conversation: InboxDemoConversationType;
    }
  | { type: "UPDATE_CONVERSATION"; conversation: InboxDemoConversationType }
  | {
      type: "GO_TO_MOCK_INBOX";
    };

export const inboxDemoReducer = produce(
  (state: inboxDemoStateType, action: inboxDemoActionType) => {
    switch (action.type) {
      case "CONVERSATION_LOAD_START":
        state.loading = true;
        break;

      case "CONVERSATION_LOAD_COMPLETE":
        state.loading = false;
        state.conversations = action.conversations;
        break;

      case "SEND_CUSTOMER_MESSAGE":
        state.step = 1;
        state.conversations = state.conversations.map((conversation) => {
          if (
            conversation.demoConversationId !==
            action.conversation.demoConversationId
          ) {
            return conversation;
          }
          return action.conversation;
        });
        break;

      case "UPDATE_CONVERSATION":
        state.conversations = state.conversations.map((conversation) => {
          if (
            conversation.demoConversationId !==
            action.conversation.demoConversationId
          ) {
            return conversation;
          }
          return action.conversation;
        });
        break;

      case "GO_TO_MOCK_INBOX":
        state.step = 2;
        break;
    }
  }
);

export const defaultState: inboxDemoStateType = {
  loading: true,
  conversations: [],
  step: 0,
};
