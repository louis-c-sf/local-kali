import MessageType from "../../../../types/MessageType";
import moment, { Moment } from "moment";

type MessageFactoryCallType = {
  id: number;
  time?: string;
  text?: string;
  status?: string;
} & Partial<MessageType>;

const defaultDate = moment("00:00", "mm:ss");

export function fromRows(data: MessageFactoryCallType[]): MessageType[] {
  return data.map((row) => {
    const { id, time, text, ...rest } = row;
    return messageFactory(
      row.id,
      row.time ? moment(row.time, "mm:ss.SSS") : defaultDate.clone(),
      row.text,
      rest
    );
  });
}

export function messageFactory(
  id: number,
  date: Moment,
  text?: string,
  rest: Partial<MessageType> = {}
): MessageType {
  return {
    ...defaultMessageValues(),
    id,
    messageContent: text || "@@DEFAULT_TEXT@@",
    createdAt: date.toISOString(),
    updatedAt: date.toISOString(),
    channel: "web",
    timestamp: date.utc(false).unix(),
    ...rest,
  };
}

export function defaultMessageValues(): MessageType {
  return {
    createdAt: "",
    id: 0,
    channel: "web",
    messageContent: "",
    channelName: "ANY",
    conversationId: "CONVERSATION_DEFAULT",
    emailFrom: { id: "ANY", email: "ANY", locale: "ANY", name: "ANY" },
    emailTo: "ANY",
    facebookReceiver: null,
    facebookSender: null,
    whatsapp360DialogSender: null,
    isSentFromSleekflow: false,
    lineReceiver: null,
    lineSender: null,
    messageAssignee: null,
    messageType: "",
    messageUniqueID: "",
    receiver: undefined,
    sender: undefined,
    status: "Sent",
    uploadedFiles: [],
    viberReceiver: null,
    viberSender: null,
    weChatReceiver: null,
    weChatSender: null,
    webClientReceiver: null,
    webClientSender: null,
    whatsappReceiver: null,
    whatsappSender: null,
    instagramReceiver: null,
    instagramSender: null,
    telegramReceiver: null,
    telegramSender: null,
    isSandbox: false,
    timestamp: 0,
    deliveryType: "Normal",
    isFromImport: false,
  };
}
