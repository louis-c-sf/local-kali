import produce from "immer";
import { Action } from "../../../types/LoginType";
import { reduceReducersWithDefaults } from "../../../utility/reduce-reducers";
import { UploadedQuickReplyFileType } from "../../../types/UploadedFileType";
import { initialUser } from "../../../context/LoginContext";
import { matchesMessageDraft } from "../mutators/chatSelectors";
import { ChatMessageDraftType } from "../../../types/state/InboxStateType";
import { reject } from "ramda";
import { MessengerState } from "../../../types/state/MessengerState";
import {
  defaultSendTemplateState,
  whatsappTemplatesReducer,
  WhatsappTemplateType,
} from "../../../App/reducers/Chat/whatsappTemplatesReducer";
import {
  defaultScheduleMessageState,
  scheduleReducer,
} from "../../../App/reducers/Chat/scheduleReducer";
import { defaultEditMessageState } from "../../../App/reducers/Chat/editMessageReducer";
import { sendAsMessageReducer } from "../../../App/reducers/sendAsMessageReducer";
import { twilioMessageReducer } from "../../../App/reducers/twilioMessageReducer";
import { pickMessagesReducer } from "../../../App/reducers/Chat/pickMessagesReducer";
import { updateTypingReducer } from "../../../App/reducers/updateTypingReducer";
import { createMessageDraft } from "./createMessageDraft";
import { interactiveMessageReducer } from "App/reducers/Chat/interactiveMessageReducer";
import {
  paymentLinkReducer,
  defaultPaymentLinkState,
} from "../../../App/reducers/Chat/paymentLinkReducer";
import { facebookReducer } from "features/Facebook/models/facebookReducer";
import { messageCartReducer } from "App/reducers/Chat/messageCartReducer";

const mainReducer = produce((draft = initialUser, action: Action) => {
  const messenger = draft.inbox.messenger;

  switch (action.type) {
    case "INBOX.MESSENGER.ATTACH_FILES":
      messenger.attachedFiles = [...messenger.attachedFiles, ...action.files];
      break;

    case "INBOX.MESSENGER.ATTACH_QUICK_FILES":
      messenger.quickReplyFiles = action.files;
      messenger.quickReplyId = action.quickReplyId;
      messenger.attachedFiles = [];
      break;

    case "INBOX.MESSENGER.REPLACE_FILES":
      messenger.attachedFiles = action.files;
      break;

    case "INBOX.MESSENGER.REMOVE_FILE":
      messenger.attachedFiles = messenger.attachedFiles.filter(
        (f: File) => f !== action.file
      );
      break;

    case "INBOX.MESSENGER.REMOVE_QUICK_FILE":
      messenger.quickReplyFiles = messenger.quickReplyFiles.filter(
        (f: UploadedQuickReplyFileType) =>
          f.quickReplyFileId !== action.file.quickReplyFileId
      );
      break;

    case "INBOX.MESSENGER.UPDATE_NOTE_TEXT":
      if (action.text.trim() === "") {
        messenger.messageAssignee = undefined;
      }
      break;

    case "INBOX.MESSENGER.UPDATE_MESSAGE_ASSIGNEE":
      messenger.messageAssignee = action.assignee;
      break;

    case "INBOX.MESSENGER.SUBMIT":
      messenger.attachedFiles = [];
      messenger.quickReplyFiles = [];
      messenger.messageAssignee = undefined;
      messenger.interactiveMessage = undefined;
      break;

    case "INBOX.MESSENGER.SELECT_MODE":
      messenger.mode = action.mode;
      break;

    case "INBOX.MESSENGER.RESET_MODE":
      messenger.mode = undefined;
      break;

    case "CHAT_SELECTED":
      messenger.attachedFiles = [];
      messenger.focusMsg = true;
      messenger.messageAssignee = undefined;
      messenger.attachedFiles = [];
      messenger.interactiveMessage = undefined;
      if (action.fromConversationId) {
        const messageDraft = draft.inbox.messageDrafts.find(
          matchesMessageDraft(action.fromConversationId)
        );
        if (messageDraft) {
          // reset mentioned text
          messageDraft.markupText = messageDraft.text;
        }
      }
      break;

    case "INBOX.MESSAGE_FILTER.UPDATED":
      draft.inbox.messagesFilter.channelName =
        action.channelName.toLocaleLowerCase() === "all"
          ? null
          : action.channelName;
      draft.inbox.messagesFilter.channelId = action.channelId ?? null;
      draft.inbox.messagesFilter.selectedFrom = action.mode;
      draft.isScrollToEnd = true;
      draft.selectedChannelFromConversation = action.channelName;
      draft.selectedChannelIdFromConversation = action.channelId;
      break;

    case "INBOX.FILTER_UPDATE":
      if (action.selectedChannel.toLowerCase() === "all") {
        draft.inbox.messagesFilter.channelName = null;
        draft.inbox.messagesFilter.channelId = null;
      } else {
        draft.inbox.messagesFilter.channelName = action.selectedChannel;
        draft.inbox.messagesFilter.channelId =
          action.selectedInstanceId ?? null;
      }
      if (action.selectedOrderBy) {
        draft.inbox.filter.orderBy = action.selectedOrderBy;
      }
      break;

    case "INBOX.FILTER_CHANNEL_UPDATE":
      if (action.selectedChannel.toLowerCase() === "all") {
        draft.inbox.messagesFilter.channelName = null;
        draft.inbox.messagesFilter.channelId = null;
      } else {
        draft.inbox.messagesFilter.channelName = action.selectedChannel;
        draft.inbox.messagesFilter.channelId =
          action.selectedInstanceId ?? null;
      }
      break;
  }
});

const messageDraftReducer = produce((state = initialUser, action: Action) => {
  const activeConversationId = state.profile.conversationId;
  let currentChatDraft: ChatMessageDraftType = state.inbox.messageDrafts.find(
    matchesMessageDraft(activeConversationId)
  );
  if (!currentChatDraft) {
    currentChatDraft = createMessageDraft(activeConversationId);
    state.inbox.messageDrafts.push(currentChatDraft);
  }
  switch (action.type) {
    case "INBOX.MESSENGER.SUBMIT":
      state.inbox.messageDrafts = reject(
        matchesMessageDraft(activeConversationId),
        state.inbox.messageDrafts
      );
      break;
    case "INBOX.MESSENGER.UPDATE_NOTE_TEXT":
      currentChatDraft.text = action.text;
      currentChatDraft.markupText = action.markupText;
      break;
    case "INBOX.MESSENGER.UPDATE_REPLY_TEXT":
      currentChatDraft.text = action.text;
      currentChatDraft.markupText = action.text;
      break;
  }
});

export const messengerReducer = reduceReducersWithDefaults(
  mainReducer,
  messageDraftReducer,
  whatsappTemplatesReducer,
  sendAsMessageReducer,
  scheduleReducer,
  interactiveMessageReducer,
  twilioMessageReducer,
  paymentLinkReducer,
  messageCartReducer,
  pickMessagesReducer,
  updateTypingReducer,
  facebookReducer
);

export function defaultMessengerState(): MessengerState {
  return {
    mode: undefined,
    messageAssignee: undefined,
    focusMsg: false,
    replyText: "",
    attachedFiles: [],
    paymentLink: defaultPaymentLinkState(),
    quickReplyFiles: [],
    quickReplyId: undefined,
    interactiveMessage: undefined,
    sendWhatsappTemplate: defaultSendTemplateState(),
    schedule: defaultScheduleMessageState(),
    editMessage: defaultEditMessageState(),
    isScheduleMode: false,
  };
}

export function defaultTemplateState(): WhatsappTemplateType {
  return {
    booted: false,
    data: {},
  };
}
