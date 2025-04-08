interface MessageConversionType {
  [key: string]: MessageFormatType;
}
export interface MessageFormatType {
  receiver: string;
  receiverId: string[];
  sender: string;
  senderId: string[];
}

export const MEGABYTE = 10 ** 6;
const defaultAttachedFileSize = 50;

export const getAttachedFileSizeLimit = (channel: string): number => {
  const channelAttachedFileSize = {
    whatsappcloudapi: 100,
    whatsapp360dialog: 16,
    twilio_whatsapp: 16,
    whatsapp_twilio: 16,
    whatsapp: 16,
  };
  return channelAttachedFileSize[channel] || defaultAttachedFileSize;
};

export const getHeaderFileFormatLimit = (
  channel: string,
  fileFormat: string
): { mimeType: string; sizeLimit: number } => {
  const defaultHeaderFileFormatMap = {
    VIDEO: {
      mimeType: "video/mp4, video/3gpp",
      sizeLimit: 16,
    },
    IMAGE: {
      mimeType: "image/jpeg, image/png",
      sizeLimit: 5,
    },
    DOCUMENT: {
      mimeType: "application/pdf",
      sizeLimit: 16,
    },
  } as const;

  const channelHeaderFileFormatMap = {
    whatsappcloudapi: {
      DOCUMENT: {
        mimeType: "application/pdf",
        sizeLimit: 100,
      },
    },
  };
  return (
    (channelHeaderFileFormatMap[channel] &&
      channelHeaderFileFormatMap[channel][fileFormat]) ||
    defaultHeaderFileFormatMap[fileFormat] || {
      mineType: "",
      sizeLimit: defaultAttachedFileSize,
    }
  );
};

const messageFormat: MessageConversionType = {
  whatsapp360dialog: {
    receiver: "whatsapp360DialogReceiver",
    receiverId: ["whatsapp360DialogReceiver", "whatsAppId"],
    sender: "whatsapp360DialogSender",
    senderId: ["whatsapp360DialogSender", "id"],
  },
  whatsappcloudapi: {
    receiver: "whatsappCloudApiReceiver",
    receiverId: ["whatsappCloudApiReceiver", "whatsappId"],
    sender: "whatsappCloudApiSender",
    senderId: ["whatsappCloudApiSender", "whatsappId"],
  },
  facebook: {
    receiver: "facebookReceiver",
    receiverId: ["facebookReceiver", "id"],
    sender: "facebookSender",
    senderId: ["facebookSender", "id"],
  },
  email: {
    receiver: "emailTo",
    sender: "emailFrom",
    receiverId: ["emailTo"],
    senderId: ["emailFrom", "email"],
  },
  sms: {
    receiver: "",
    sender: "smsSender",
    receiverId: [""],
    senderId: ["smsSender", "id"],
  },
  whatsapp: {
    receiver: "whatsappReceiver",
    sender: "whatsappSender",
    receiverId: ["whatsappReceiver", "id"],
    senderId: ["whatsappSender", "id"],
  },
  instagram: {
    receiver: "instagramReceiver",
    sender: "instagramSender",
    receiverId: ["instagramReceiver", "instagramPageId"],
    senderId: ["instagramSender", "instagramPageId"],
  },
  twilio_whatsapp: {
    receiver: "whatsappReceiver",
    sender: "whatsappSender",
    receiverId: ["whatsappReceiver", "id"],
    senderId: ["whatsappSender", "id"],
  },
  line: {
    receiver: "lineReceiver",
    sender: "lineSender",
    receiverId: ["lineReceiver", "userId"],
    senderId: ["lineSender", "userId"],
  },
  web: {
    sender: "sender",
    receiverId: ["webClientReceiver", "webClientUUID"],
    receiver: "webClientReceiver",
    senderId: ["webClientSender", "webClientUUID"],
  },
  note: {
    sender: "sender",
    receiverId: ["messageAssignee", "userInfo", "id"],
    receiver: "messageAssignee",
    senderId: ["sender", "id"],
  },
  wechat: {
    sender: "weChatSender",
    receiverId: ["weChatReceiver", "openid"],
    receiver: "weChatReceiver",
    senderId: ["weChatSender", "openid"],
  },
  viber: {
    sender: "viberSender",
    receiverId: ["viberReceiver", "viberUserId"],
    receiver: "viberReceiver",
    senderId: ["viberSender", "viberUserId"],
  },
  telegram: {
    sender: "telegramSender",
    senderId: ["telegramSender", "telegramBotId"],
    receiver: "telegramReceiver",
    receiverId: ["telegramReceiver", "telegramBotId"],
  },
  naive: {
    sender: "sender",
    receiverId: ["messageAssignee", "userInfo", "id"],
    receiver: "messageAssignee",
    senderId: ["sender", "id"],
  },
};
export default messageFormat;
