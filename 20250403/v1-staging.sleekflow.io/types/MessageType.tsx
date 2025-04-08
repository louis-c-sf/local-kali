import UploadedFileType, { UploadedFileProxyType } from "./UploadedFileType";
import {
  LineUserType,
  WebClientType,
  WeChatUserType,
  InstagramUserType,
  ViberUserType,
  TelegramUserType,
  WhatsApp360DialogUserType,
} from "types/LoginType";
import { AssigneeType, UserInfoType } from "./ConversationType";
import { ChannelType } from "component/Chat/Messenger/types";
import { AUDIO_TYPES } from "component/Chat/Records/AudioRecord";
import { prop } from "ramda";
import { HeaderComponentType } from "./WhatsappTemplateResponseType";
import { isImageMime, isAudioMime, isVideoMime } from "lib/utility/mime";
import {
  PaymentAttachedToMessage,
  PaymentLinkProxyType,
} from "core/models/Ecommerce/Payment/PaymentLInkProxyType";
import {
  ExtendedMessageType,
  WhatsappCloudAPIMessagePayloadType,
  WhatsappCloudAPIMessageType,
  WhatsappCloudAPIUserType,
  WhatsappTwilioContentExtendMessageType,
  WhatsappTwilioContentMessageType,
} from "core/models/Message/WhatsappCloudAPIMessageType";

export interface DetectedLanguageType {
  language: string;
  score: number;
}

export interface TranslationType {
  text: string;
  to: string;
}

export interface TranslationResultType {
  detectedLanguage: DetectedLanguageType;
  translations: TranslationType[];
}

export interface EmailFromType {
  id: string;
  email: string;
  name: string;
  locale: string;
}

export type MessageChannelType = ChannelType | "note";

export type MessageDeliveryType =
  | "AutomatedMessage"
  | "Normal"
  | "Broadcast"
  | "PaymentLink";

export type WhatsappAdClickPayloadType = {
  source_type: "ad";
  headline: string;
  source_id: string;
  source_url: string;
  body?: string;
};

export interface WhatsappCloudApiAdExtendedMessagePayloadType {
  whatsappCloudApiReferral?: WhatsappAdClickPayloadType;
}

export interface FacebookAdExtendedMessagePayloadType {
  facebookAdClickToMessengerObject?: {
    ad_id: string;
    ad_title: string;
    ad_text: string;
    ad_permalink_url: string;
    message: string;
  };
}

interface FacebookExtendedMessagePayloadType {
  facebookMessagePayload?: {
    attachment?: {
      payload?: {
        payload?: string;
        template_type?: string;
        title?: string;
      };
    };
    text?: string;
  };
}

interface GenericExtendedMessagePayloadType
  extends WhatsappCloudAPIMessagePayloadType,
    WhatsappTwilioContentMessageType,
    FacebookExtendedMessagePayloadType,
    FacebookAdExtendedMessagePayloadType,
    WhatsappCloudApiAdExtendedMessagePayloadType {}

export type ExtendedMessagePayloadType = {
  channel?: string;
  extendedMessagePayloadDetail: GenericExtendedMessagePayloadType;
  extendedMessageType: ExtendedMessageType;
  id?: string;
};

export default interface MessageType extends WhatsappCloudAPIMessageType {
  id: number;
  conversationId: string;
  messageUniqueID: string;
  channel: MessageChannelType;
  senderId?: string;
  receiverId?: string;
  receiver:
    | (EmailFromType &
        (FacebookMessageType | WhatsappType | WebClientType | string) &
        UserInfoType)
    | any;
  messageType: string;
  messageContent: string;
  createdAt: string;
  updatedAt?: string;
  scheduleSentAt?: string;
  sender:
    | (EmailFromType &
        (
          | WeChatUserType
          | FacebookMessageType
          | WhatsappType
          | WebClientType
          | string
        ) &
        UserInfoType)
    | any;
  uploadedFiles: UploadedFileType[];
  emailTo: string;
  emailFrom: EmailFromType;
  webClientReceiver: WebClientType | null;
  webClientSender: WebClientType | null;
  facebookSender: FacebookMessageType | null;
  facebookReceiver: FacebookMessageType | null;
  whatsappReceiver: WhatsappType | null;
  whatsappSender: WhatsappType | null;
  whatsappCloudApiReceiver?: WhatsappCloudAPIUserType;
  whatsappCloudApiSender?: WhatsappCloudAPIUserType;
  weChatReceiver: WeChatUserType | null;
  weChatSender: WeChatUserType | null;
  messageAssignee: AssigneeType | null;
  lineReceiver: LineUserType | null;
  lineSender: LineUserType | null;
  instagramReceiver: InstagramUserType | null;
  instagramSender: InstagramUserType | null;
  telegramSender: TelegramUserType | null;
  telegramReceiver: TelegramUserType | null;
  viberSender: ViberUserType | null;
  viberReceiver: ViberUserType | null;
  whatsapp360DialogSender: WhatsApp360DialogUserType | null;
  isReceiverStaff?: boolean;
  isSenderStaff?: boolean;
  status: string | "PaymentLinkPaid" | "PaymentLinkCanceled";
  quotedMsgBody?: string;
  quotedMsgId?: string;
  deliveryType: MessageDeliveryType;
  /* is missing when the messages received from outside */
  messageChecksum?: string;
  /* is used when searching message and specified the searched message */
  isSelected?: boolean;
  channelName: string;
  channelStatusMessage?: string;
  isSentFromSleekflow: boolean;
  whatsapp360DialogExtendedMessagePayload?: Whatsapp360DialogExtendedMessagePayloadType;
  isSandbox: boolean;
  timestamp: number;
  storyURL?: string;
  sleekPayRecordProxy?: PaymentLinkProxyType;
  sleekPayRecord?: PaymentAttachedToMessage;
  sleekPayRecordId?: number;
  extendedMessagePayload?: ExtendedMessagePayloadType;
  isFromImport: boolean;
}

interface MessageWithWhatsappAdClickPayloadType extends MessageType {
  extendedMessagePayload: ExtendedMessagePayloadType & {
    extendedMessagePayloadDetail: {
      whatsappCloudApiReferral: WhatsappAdClickPayloadType;
    };
  };
}

type QuickReplyAction = {
  buttons: {
    type: string;
    reply: {
      id: string;
      title: string;
    };
  }[];
};

type ListMessageAction = {
  button: string;
  sections: {
    title?: string;
    rows: {
      id: string;
      title: string;
      description?: string;
    }[];
  }[];
};

export type ListMessageObjectType = {
  type: string;
  body: {
    type: "text" | string;
    text: string;
  };
  action: ListMessageAction;
};

export type QuickReplyObjectType = {
  type: string;
  body: {
    type: "text" | string;
    text: string;
  };
  action: QuickReplyAction;
};

export type WhatsappInteractiveObjectType =
  | ListMessageObjectType
  | QuickReplyObjectType;

export interface Whatsapp360DialogExtendedMessagePayloadType {
  id?: number;
  whatsapp360DialogTemplateMessage?: Whatsapp360DialogTemplateMessageType;
  whatsapp360DialogInteractiveObject?: WhatsappInteractiveObjectType;
}

export type TemplateMessageComponentType =
  | Whatsapp360DialogTemplateMessageComponentHeaderType
  | Whatsapp360DialogTemplateMessageComponentBodyType
  | Whatsapp360DialogTemplateMessageComponentButtonType;

export interface Whatsapp360DialogTemplateMessageType {
  templateNamespace: string;
  templateName: string;
  language: string;
  components?: Array<TemplateMessageComponentType>;
}

export interface Whatsapp360DialogTemplateMessageComponentGeneralType {
  type: "header" | "body" | "footer" | "button";
}

export interface Whatsapp360DialogTemplateMessageComponentBodyType
  extends Whatsapp360DialogTemplateMessageComponentGeneralType {
  type: "body";
  parameters: Array<Whatsapp360DialogTemplateMessageComponentTextParameterType>;
}

export type ButtonSubType = "quick_reply" | "url" | "reply" | "phone";

export interface Whatsapp360DialogTemplateMessageComponentButtonType
  extends Whatsapp360DialogTemplateMessageComponentGeneralType {
  type: "button";
  sub_type: ButtonSubType;
  index: number;
  parameters?: Array<
    | {
        type: "payload";
        payload: string;
      }
    | {
        type: "text";
        text: string;
      }
  >;
}

export interface Whatsapp360DialogTemplateMessageComponentFooterType
  extends Whatsapp360DialogTemplateMessageComponentGeneralType {
  type: "footer";
}

export interface Whatsapp360DialogTemplateMessageComponentHeaderType
  extends Whatsapp360DialogTemplateMessageComponentGeneralType {
  type: "header";
  parameters?: Array<Whatsapp360DialogTemplateMessageComponentHeaderParameterType>;
}

export type Whatsapp360DialogTemplateMessageComponentHeaderParameterType =
  | Whatsapp360DialogTemplateMessageComponentTextParameterType
  | Whatsapp360DialogTemplateMessageComponentDocumentParameterType
  | Whatsapp360DialogTemplateMessageComponentVideoParameterType
  | Whatsapp360DialogTemplateMessageComponentImageParameterType;

export interface Whatsapp360DialogTemplateMessageComponentTextParameterType {
  type: "text";
  text: string;
}

export interface Whatsapp360DialogTemplateMessageComponentDocumentParameterType {
  type: "document";
  document: {
    id?: string;
    link: string;
    filename: string;
  };
}

export interface Whatsapp360DialogTemplateMessageComponentImageParameterType {
  type: "image";
  image: {
    id?: string;
    link: string;
    filename?: string;
  };
}

export interface Whatsapp360DialogFileResponseType {
  id: string;
  blobContainer: string;
  blobFilePath: string;
  filename: string;
  mimeType: string;
  url: string;
  fileSize: number;
  displayName: string;
  whatsAppMediaType: string;
  whatsApp360DialogConfigId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Whatsapp360DialogTemplateMessageComponentVideoParameterType {
  type: "video";
  video: {
    id?: string;
    link: string;
  };
}

export interface WhatsappType {
  id: string;
  locale: string;
  phone_number: string;
  name: string;
  instanceId: string;
  profile_pic?: string;
  is_group: boolean;
  is_twilio: boolean;
}

export interface FacebookMessageType {
  id: string;
  name: string;
  email: string;
  locale: string;
  pageId: string;
  profile_pic: string;
}

export function isNoteMessage(message: MessageType) {
  return "note".includes(message.channel);
}

export function isTextMessage(message: MessageType) {
  return Boolean(message.messageContent);
}

export function isReactionMessage(message: MessageType) {
  return message.messageType === "reaction";
}

export function isAttachmentMessage(message: MessageType) {
  return message.messageType === "file" || message.uploadedFiles.length > 0;
}

export function isInteractiveMessage(message: MessageType) {
  return (
    message.messageType === "interactive" &&
    Boolean(
      message.whatsapp360DialogExtendedMessagePayload
        ?.whatsapp360DialogInteractiveObject ||
        message.extendedMessagePayload?.extendedMessagePayloadDetail
          .whatsappCloudApiInteractiveObject
    )
  );
}

export function isFacebookAdClickedMessage(message: MessageType): boolean {
  return Boolean(
    message.extendedMessagePayload?.extendedMessagePayloadDetail
      ?.facebookAdClickToMessengerObject?.ad_permalink_url
  );
}

export function isWhatsappAdClickedMessage(
  message: MessageType
): message is MessageWithWhatsappAdClickPayloadType {
  const referral =
    message.extendedMessagePayload?.extendedMessagePayloadDetail
      ?.whatsappCloudApiReferral;
  return Boolean(referral);
}

export function isFacebookOTNRequestMessage(message: MessageType): boolean {
  return (
    message.extendedMessagePayload?.extendedMessageType ===
    ExtendedMessageType.FacebookOTNRequest
  );
}

export function isAudioMessage(message: MessageType) {
  if (message.messageType !== "file" || message.uploadedFiles.length !== 1) {
    return false;
  }
  const [firstFile] = message.uploadedFiles;
  const proxyType = (firstFile as UploadedFileProxyType).proxyType;
  if (proxyType === "audio") {
    return true;
  }
  if (firstFile?.mimeType === "" && firstFile?.filename) {
    const audioExtensions = Object.values(AUDIO_TYPES).map(prop("extension"));
    const [extension] = firstFile.filename.match(/(?!\w\.)[a-z0-9]+$/i) ?? [];
    if (extension) {
      return audioExtensions.includes(extension.toLowerCase());
    }
  }

  return Object.keys(AUDIO_TYPES).includes(firstFile?.mimeType);
}

export function isAttachedAudio(file: UploadedFileType) {
  return isAudioMime(file.mimeType);
}

export function isAttachedVideo(file: UploadedFileType) {
  return isVideoMime(file.mimeType);
}

export function isAttachedPdf(file: UploadedFileType) {
  return file?.mimeType?.includes("pdf");
}

export function isAttachedImage(message: MessageType, file: UploadedFileType) {
  return isImageMime(file.mimeType) && message.channel !== "email";
}

export function isStaffMessage(message: MessageType) {
  return message.channel === "note"
    ? true
    : message.isSenderStaff || message.isSentFromSleekflow;
}

export function isDeletedMessage(message: MessageType) {
  return message.status === "Deleted";
}

export function convertHeaderParameterType(
  x: HeaderComponentType,
  component?: TemplateMessageComponentType
) {
  if (!component) {
    return;
  }
  switch (x.format) {
    case "TEXT":
      return component.parameters as Array<Whatsapp360DialogTemplateMessageComponentTextParameterType>;
    case "IMAGE":
      return component.parameters as Array<Whatsapp360DialogTemplateMessageComponentImageParameterType>;
    case "DOCUMENT":
      return component.parameters as Array<Whatsapp360DialogTemplateMessageComponentDocumentParameterType>;
    case "VIDEO":
      return component.parameters as Array<Whatsapp360DialogTemplateMessageComponentVideoParameterType>;
  }
}
