import uuid from "uuid";
import { ChannelType } from "./types";
import moment, { Moment } from "moment";
import {
  SendInteractiveMessageType,
  SendInteractiveMessageWithContentType,
} from "../../../types/SendMessageType";
import { getChannelId, useChatSelectors } from "../utils/useChatSelectors";
import MessageConversion from "../../../config/MessageConversion";
import { equals } from "ramda";
import MessageType, {
  ExtendedMessagePayloadType,
  ListMessageObjectType,
  MessageChannelType,
  QuickReplyObjectType,
  Whatsapp360DialogExtendedMessagePayloadType,
} from "../../../types/MessageType";
import UploadedFileType, {
  UploadedFileProxyType,
  UploadedQuickReplyFileType,
} from "../../../types/UploadedFileType";
import useSelectedChat from "../../../lib/effects/useSelectedChat";
import { useMessengerMode } from "../hooks/Labels/useMessengerMode";
import {
  ButtonType,
  InteractiveMessageValues,
} from "../InteractiveMessage/InteractiveMessageSchema";
import {
  WhatsappCloudAPIMessageType,
  ExtendedMessageType,
  WhatsappTwilioContentExtendMessageType,
} from "core/models/Message/WhatsappCloudAPIMessageType";
import { PaymentLinkStateType } from "App/reducers/Chat/paymentLinkReducer";
import { useAppDispatch, useAppSelector } from "AppRootContext";
import { submitSendMessage } from "api/Chat/submitSendMessage";
import { post } from "api/apiRequest";
import { PaymentLinkProxyType } from "core/models/Ecommerce/Payment/PaymentLInkProxyType";
import useGetCurrentChannel from "../useGetCurrentChannel";
import mixpanel from "mixpanel-browser";

const CHANNELS_ALLOW_ADD_NAME: ChannelType[] = [
  "whatsapp",
  "twilio_whatsapp",
  "facebook",
  "wechat",
  "line",
  "whatsapp360dialog",
  "whatsappcloudapi",
];

function sendMessageKey(channel: string) {
  switch (channel.toLowerCase()) {
    case "line":
      return "LineReceiverId";
    case "wechat":
      return "WeChatReceiverOpenId";
    case "whatsapp":
      return "WhatsappReceiverId";
    case "twilio_whatsapp":
      return "WhatsappReceiverId";
    case "sms":
      return "SMSReceiverId";
    case "facebook":
      return "FacebookReceiverId";
    case "whatsapp360dialog":
      return "whatsapp360dialogReceiverId";
    case "whatsappcloudapi":
      return "whatsappCloudApiReceiverId";
  }
}
export function trackMessageSend(channel: string) {
  mixpanel.track("Message Sent From Inbox", {
    Platform: "Web v1",
    Channel: channel,
  });
}
export function useSendMessage() {
  const loginDispatch = useAppDispatch();
  const { lastChannel: channel } = useChatSelectors();
  const loggedInUserDetail = useAppSelector(
    (s) => s.loggedInUserDetail,
    equals
  );
  const company = useAppSelector((s) => s.company, equals);
  const profile = useAppSelector((s) => s.profile, equals);
  const quickReplyFiles = useAppSelector(
    (s) => s.inbox.messenger.quickReplyFiles,
    equals
  );
  const quickReplyId = useAppSelector(
    (s) => s.inbox.messenger.quickReplyId,
    equals
  );
  const quote = useAppSelector((s) => s.inbox.quote, equals);
  const messageAssignee = useAppSelector(
    (s) => s.inbox.messenger.messageAssignee,
    equals
  );
  const { selectedChatMessages } = useSelectedChat(profile.conversationId);
  const isDisplayTwilioDefaultMessage = useAppSelector(
    (s) => s.isDisplayTwilioDefaultoMessage
  );
  const isScheduleActive = useAppSelector(
    (s) => s.inbox.messenger.mode === "schedule"
  );
  const scheduleDate = useAppSelector(
    (s) => s.inbox.messenger.schedule.value,
    equals
  );
  const facebookMessageType = useAppSelector(
    (s) => s.inbox.facebook.messageType,
    equals
  );
  const messagesFilter = useAppSelector((s) => s.inbox.messagesFilter, equals);

  const { currentChannelId, currentChannel, currentChannelIdentity } =
    useGetCurrentChannel(messagesFilter);
  const messageChannel = currentChannel?.toLowerCase() as ChannelType;

  const { messengerMode = "reply" } = useMessengerMode();
  async function sendMessageText(
    message: string,
    payload: {
      whatsapp360Dialog?: Whatsapp360DialogExtendedMessagePayloadType;
      whatsappCloudApi?: WhatsappCloudAPIMessageType;
      twilioContentObject?: WhatsappTwilioContentExtendMessageType;
      transaction?: PaymentLinkStateType["transaction"];
    }
  ) {
    loginDispatch({ type: "INBOX.MESSENGER.SUBMIT" });

    const uuidChecksum = uuid();

    let messageToSend = message;
    const timestamp = moment().utc();
    if (
      loggedInUserDetail?.isShowName &&
      CHANNELS_ALLOW_ADD_NAME.includes(messageChannel) &&
      !isDisplayTwilioDefaultMessage
    ) {
      messageToSend = `*${loggedInUserDetail.userInfo.firstName}*\n${message}`;
    }
    const {
      whatsapp360Dialog,
      transaction,
      whatsappCloudApi,
      twilioContentObject,
    } = payload;
    const messageType =
      whatsapp360Dialog || whatsappCloudApi ? "template" : "text";
    let messageParam: SendInteractiveMessageWithContentType = {
      messageGroupName: (company && company.signalRGroupName) || "",
      messageContent: messageToSend,
      messageType: messageType,
      messageChecksum: uuidChecksum,
      conversationId: profile.conversationId,
    };

    if (currentChannelIdentity) {
      messageParam.channelIdentityId = currentChannelIdentity;
    }

    let hasPaymentPayload = false;

    if (
      transaction?.paymentSent &&
      transaction?.linkGenerated &&
      "paymentIntentId" in transaction?.linkGenerated
    ) {
      messageParam.paymentIntentId = transaction.linkGenerated.paymentIntentId; //TODO: check ???
      hasPaymentPayload = true;
    } else if (whatsapp360Dialog) {
      messageParam = {
        ...messageParam,
        whatsapp360DialogExtendedMessagePayload: {
          ...whatsapp360Dialog,
        },
      };
    } else if (whatsappCloudApi?.extendedMessagePayload) {
      messageParam = {
        ...messageParam,
        extendedMessagePayload: {
          ...whatsappCloudApi.extendedMessagePayload,
        },
      };
    } else if (
      twilioContentObject &&
      twilioContentObject.extendedMessagePayload
    ) {
      messageParam = {
        ...messageParam,
        extendedMessagePayload: {
          ...twilioContentObject.extendedMessagePayload,
        },
      };
    }
    if (messageChannel === "web") {
      messageParam = {
        ...messageParam,
        channel: messageChannel,
        webClientSenderId: getChannelId(messageChannel, profile) as string,
      };
    } else if (MessageConversion[messageChannel]) {
      messageParam = {
        ...messageParam,
        channel: messageChannel,
      };
      const channelIdKey = sendMessageKey(messageChannel);
      if (channelIdKey) {
        messageParam[channelIdKey] = getChannelId(messageChannel, profile);
      }

      if (messageChannel === "twilio_whatsapp") {
        messageParam = {
          ...messageParam,
          channel: "whatsapp",
        };
      }

      if (currentChannelIdentity) {
        messageParam = {
          ...messageParam,
          channelIdentityId: currentChannelIdentity,
        };
      }

      if (messageChannel === "facebook" && facebookMessageType.value) {
        const param =
          facebookMessageType.type === "facebookOTN"
            ? {
                extendedMessagePayload: {
                  channel: "facebook",
                  extendedMessageType: ExtendedMessageType.FacebookOTNText,
                  facebookOTNTopicId: facebookMessageType.value,
                  extendedMessagePayloadDetail: {
                    facebookMessagePayload: {
                      text: message,
                    },
                  },
                },
              }
            : {
                messageTag: facebookMessageType.value,
              };
        messageParam = {
          ...messageParam,
          ...param,
        };
      }
      loginDispatch({ type: "INBOX.FACEBOOK.MESSAGE_TYPE.RESET" });
    }
    if (quickReplyFiles.length > 0) {
      messageParam.fileURLs = quickReplyFiles.map((f) => f.url);
      messageParam.quickReplyId = String(quickReplyId);
    }
    if (scheduleDate) {
      messageParam.scheduleSentAt = scheduleDate.toISOString();
    }
    saveProxyMessage(
      "text",
      messageChannel,
      message,
      [],
      uuidChecksum,
      timestamp,
      undefined,
      payload.whatsapp360Dialog,
      messageParam.extendedMessagePayload,
      hasPaymentPayload ? transaction?.paymentSent ?? undefined : undefined
    );
    if (quote.id) {
      messageParam.quotedMsgId = quote.id;
    }
    if (!channel) {
      return;
    }
    return submitSendMessage(messageParam);
  }

  async function sendMessageNote(message: string) {
    loginDispatch({ type: "INBOX.MESSENGER.SUBMIT" });
    const uuidChecksum = uuid();
    let formData = new FormData();
    const timestamp = moment().utc();
    saveProxyMessage("text", "note", message, [], uuidChecksum, timestamp);
    formData = fillCommonForm(formData, message, uuidChecksum);

    if (messageAssignee) {
      formData.append("assigneeId", messageAssignee.userInfo.id);
    }
    formData.append("messageType", "text");

    return post(`/Conversation/Note/${profile.conversationId}`, {
      param: formData,
      header: { "Content-Type": "application/x-www-form-urlencoded" },
    }).then(() => trackMessageSend("note"));
  }

  function sendFilesAttached(
    message: string,
    files: File[],
    proxyType?: string
  ) {
    loginDispatch({ type: "INBOX.MESSENGER.SUBMIT" });
    let formData = new FormData();
    const uuidChecksum = uuid();
    const timestamp = moment().utc();

    saveProxyMessage(
      "file",
      messageChannel,
      message,
      files,
      uuidChecksum,
      timestamp,
      proxyType
    );

    formData = fillCommonForm(formData, message, uuidChecksum);
    formData = fillFilesForm(formData, files);
    formData = fillQuickReplyFiles(formData, quickReplyFiles, quickReplyId);
    if (quote.id) {
      formData.append("quotedMsgId", quote.id);
    }
    if (currentChannelIdentity) {
      formData.append("channelIdentityId", currentChannelIdentity);
    }
    formData.append(
      "channel",
      messageChannel.toLowerCase() === "twilio_whatsapp"
        ? "whatsapp"
        : messageChannel
    ); //need to add configuration for selectedType matching
    if (messageChannel === "web") {
      formData.append(
        "webClientSenderId",
        (getChannelId(messageChannel, profile) as string) || ""
      );
    } else {
      formData.append(
        sendMessageKey(messageChannel) || "",
        (getChannelId(messageChannel, profile) as string) || ""
      );
    }

    if (!channel) {
      //todo handle this
      return;
    }

    return post("/ConversationMessages/SendFileMessage", {
      param: formData,
      header: { "Content-Type": "application/x-www-form-urlencoded" },
    }).then(() => trackMessageSend(messageChannel));
  }

  async function sendNoteFilesAttached(
    message: string,
    files: File[],
    proxyType?: string
  ) {
    loginDispatch({ type: "INBOX.MESSENGER.SUBMIT" });

    let formData = new FormData();
    const uuidChecksum = uuid();
    const timestamp = moment().utc();
    saveProxyMessage(
      "file",
      "note",
      message,
      files,
      uuidChecksum,
      timestamp,
      proxyType
    );

    formData = fillCommonForm(formData, message, uuidChecksum);
    formData = fillFilesForm(formData, files);
    if (messageAssignee) {
      formData.append("assigneeId", messageAssignee.userInfo.id as string);
    }
    return post(`/Conversation/Note/${profile.conversationId}`, {
      param: formData,
      header: { "Content-Type": "application/x-www-form-urlencoded" },
    }).then(() => trackMessageSend("note"));
  }

  async function sendInteractiveMessage(
    message: string,
    interactiveMessage: InteractiveMessageValues
  ) {
    const messageChannel = channel.toLowerCase() as ChannelType;
    if (!["whatsapp360dialog", "whatsappcloudapi"].includes(messageChannel)) {
      return;
    }

    loginDispatch({ type: "INBOX.MESSENGER.SUBMIT" });
    const uuidChecksum = uuid();
    const scheduleParam = scheduleDate
      ? { scheduleSentAt: scheduleDate.toISOString() }
      : {};

    let messageParam: SendInteractiveMessageType = {
      channel: messageChannel,
      messageGroupName: company?.signalRGroupName ?? "",
      messageChecksum: uuidChecksum,
      messageType: "interactive",
      conversationId: profile.conversationId,
      [`${sendMessageKey(messageChannel)}`]: getChannelId(
        messageChannel,
        profile
      ),
      ...scheduleParam,
    };

    if (currentChannelIdentity) {
      messageParam.channelIdentityId = currentChannelIdentity;
    }

    if (
      interactiveMessage.buttonType === ButtonType.QUICK_REPLY &&
      interactiveMessage.quickReplies
    ) {
      const quickReplyAction = interactiveMessage.quickReplies.map((reply) => ({
        type: "reply",
        reply: {
          id: uuid(),
          title: reply,
        },
      }));

      const quickReplyObject: QuickReplyObjectType = {
        type: "button",
        body: {
          type: "text",
          text: message,
        },
        action: {
          buttons: quickReplyAction,
        },
      };
      if (channel === "whatsapp360dialog") {
        return submitSendMessage({
          ...messageParam,
          whatsapp360DialogExtendedMessagePayload: {
            whatsapp360DialogInteractiveObject: quickReplyObject,
          },
        });
      } else if (channel === "whatsappcloudapi") {
        return submitSendMessage({
          ...messageParam,
          channelIdentityId: currentChannelIdentity,
          extendedMessagePayload: {
            extendedMessageType:
              ExtendedMessageType.WhatsappCloudApiInteractiveMessage,
            channel: "whatsappcloudapi",
            extendedMessagePayloadDetail: {
              whatsappCloudApiInteractiveObject: quickReplyObject,
            },
          },
        });
      } else {
        throw `Unsupported channel ${channel}`;
      }
    } else if (
      interactiveMessage.buttonType === ButtonType.LIST_MESSAGE &&
      interactiveMessage.listMessage
    ) {
      const { listMessage } = interactiveMessage;

      const sections = listMessage.sections.map((section) => ({
        title: section.title,
        rows: section.options.map((option) => ({
          id: uuid(),
          title: option.name,
          description: option.description,
        })),
      }));

      const interactiveObject: ListMessageObjectType = {
        type: "list",
        body: {
          type: "text",
          text: message,
        },
        action: {
          button: listMessage.title,
          sections,
        },
      };

      if (channel === "whatsapp360dialog") {
        return submitSendMessage({
          ...messageParam,
          whatsapp360DialogExtendedMessagePayload: {
            whatsapp360DialogInteractiveObject: interactiveObject,
          },
        });
      } else if (channel === "whatsappcloudapi") {
        return submitSendMessage({
          ...messageParam,
          extendedMessagePayload: {
            extendedMessageType:
              ExtendedMessageType.WhatsappCloudApiInteractiveMessage,
            channel: "whatsappcloudapi",
            extendedMessagePayloadDetail: {
              whatsappCloudApiInteractiveObject: interactiveObject,
            },
          },
        });
      } else {
        throw `Unsupported channel ${channel}`;
      }
    }
  }

  function fillCommonForm(
    formData: FormData,
    message: string,
    checksum: string
  ) {
    formData.append("messageGroupName", company?.signalRGroupName || "");
    formData.append("messageContent", message);
    formData.append("conversationId", profile!.conversationId);
    formData.append("messageChecksum", checksum);
    if (currentChannelIdentity) {
      formData.append("channelIdentityId", currentChannelIdentity);
    }

    if (messageChannel === "whatsapp360dialog") {
      formData.append(
        "channelId",
        String(profile.whatsApp360DialogUser?.channelId)
      );
    }
    if (messengerMode === "schedule" && scheduleDate) {
      formData.append("scheduleSentAt", scheduleDate.toISOString());
    }

    return formData;
  }

  function fillFilesForm(formData: FormData, files: File[]) {
    files.forEach((f) => {
      formData.append("files", f);
    });
    formData.append("messageType", "file");

    return formData;
  }

  function fillQuickReplyFiles(
    formData: FormData,
    files: UploadedQuickReplyFileType[],
    quickReplyId?: number
  ) {
    if (!quickReplyId) {
      return formData;
    }
    files.forEach((f) => {
      formData.append("fileURLs", f.url);
    });
    formData.append("QuickReplyId", String(quickReplyId));
    return formData;
  }

  function saveProxyMessage(
    messageType: "file" | "text",
    messageChannel: MessageChannelType,
    text: string,
    files: File[],
    uuidChecksum: string,
    timestamp: Moment,
    proxyType?: string,
    whatsapp360Dialog?: Whatsapp360DialogExtendedMessagePayloadType,
    extendMessage?: ExtendedMessagePayloadType,
    payment?: PaymentLinkProxyType
  ) {
    const lastChatMessage: MessageType[] =
      selectedChatMessages.length > 0
        ? selectedChatMessages.sort((a, b) => a.id - b.id)
        : profile?.conversation?.list ?? [];
    const selectedChatStaff =
      messageChannel === "note"
        ? lastChatMessage.filter(
            (chat) => chat.isSenderStaff && chat.channel === "note"
          )
        : lastChatMessage.filter(
            (chat) => chat.isSenderStaff && chat.channel !== "note"
          );
    const currentTimeISOString = timestamp.toISOString();
    const deliveryType = payment ? "PaymentLink" : "Normal";
    let newChatMessage: MessageType = {
      ...(selectedChatStaff[selectedChatStaff.length - 1] || {}),
      id:
        lastChatMessage.length > 0
          ? Number(lastChatMessage[lastChatMessage.length - 1].id) + 1
          : 1,
      conversationId: profile?.conversationId ?? "",
      messageChecksum: uuidChecksum,
      messageUniqueID: "",
      messageContent: text,
      messageType: messageType,
      status: channel || messengerMode === "note" ? "Sending" : "failed",
      quotedMsgBody: "",
      quotedMsgId: undefined,
      isSenderStaff: true,
      isSentFromSleekflow: true,
      isReceiverStaff: false,
      deliveryType,
      timestamp: timestamp.utc(false).unix(),
      scheduleSentAt: scheduleDate ? currentTimeISOString : undefined,
      createdAt: currentTimeISOString,
      updatedAt: currentTimeISOString,
      whatsapp360DialogExtendedMessagePayload: whatsapp360Dialog
        ? { ...whatsapp360Dialog }
        : undefined,
      extendedMessagePayload: extendMessage ? { ...extendMessage } : undefined,
      sleekPayRecordProxy: undefined,
    };
    if (loggedInUserDetail) {
      newChatMessage = {
        ...newChatMessage,
        sender: {
          ...loggedInUserDetail.userInfo,
          name:
            loggedInUserDetail.userInfo.displayName ||
            loggedInUserDetail.userInfo.email,
          locale: loggedInUserDetail.locale,
        },
      };
    }

    if (quote.id) {
      newChatMessage.quotedMsgId = quote.id;
    }

    if (messageChannel === "note") {
      newChatMessage = {
        ...newChatMessage,
        channel: "note",
        status: "Read",
      };
      const chatMessageAssignee = messageAssignee;
      if (chatMessageAssignee) {
        newChatMessage = {
          ...newChatMessage,
          messageAssignee: {
            userInfo: chatMessageAssignee.userInfo,
            locale: chatMessageAssignee.locale,
            timeZone: chatMessageAssignee.timeZone,
          },
        };
      }
    } else {
      newChatMessage = { ...newChatMessage, channel: messageChannel };
    }

    newChatMessage.uploadedFiles = files.map(
      (file) =>
        ({
          blobContainer: "",
          channel: messageChannel,
          fileId: "",
          filename: file.name,
          id: 0,
          messageTopic: "",
          sender: newChatMessage.sender,
          senderId: newChatMessage.sender ? newChatMessage.sender.id : null,
          url: "",
          mimeType: file.type,
          proxyFile: file,
          proxyType,
        } as UploadedFileProxyType)
    );

    newChatMessage.uploadedFiles = quickReplyFiles.reduce<UploadedFileType[]>(
      (acc, next) => {
        return [
          ...acc,
          {
            url: next.url,
            previewUrl: next.previewUrl,
            mimeType: next.mimeType,
            filename: next.filename,
            id: 0,
            fileId: next.quickReplyFileId,
            blobContainer: next.blobContainer,
            channel: messageChannel,
            messageTopic: "",
            sender: newChatMessage.sender,
          },
        ];
      },
      newChatMessage.uploadedFiles
    );

    if (channel.toLowerCase() === "whatsapp") {
      newChatMessage = {
        ...newChatMessage,
        receiver: profile.whatsAppAccount,
        whatsappReceiver: profile.whatsAppAccount ?? null,
      };
    }
    if (isScheduleActive && scheduleDate) {
      newChatMessage.status = "Scheduled";
    }
    loginDispatch({
      type: "UPDATE_SELECTED_CHAT",
      newMessage: newChatMessage,
      createdAt: timestamp.format(),
      channel,
    });
  }

  return {
    sendMessageText,
    sendMessageNote,
    sendFilesAttached,
    sendNoteFilesAttached,
    sendInteractiveMessage,
  };
}
