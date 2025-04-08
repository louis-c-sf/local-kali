import {
  TemplateMessageComponentType,
  WhatsappInteractiveObjectType,
} from "types/MessageType";

export interface WhatsappCloudAPIUserType {
  whatsappId: string;
  whatsappUserDisplayName: string;
  whatsappChannelPhoneNumber: string;
}

export interface WhatsappCloudAPIMessageType {
  whatsappCloudApiSender?: WhatsappCloudAPIUserType;
  whatsappCloudApiReceiver?: WhatsappCloudAPIUserType;
  extendedMessagePayload?: {
    channel?: string;
    extendedMessageType: ExtendedMessageType;
    extendedMessagePayloadDetail: WhatsappCloudAPIMessagePayloadType;
  };
}

export interface WhatsappTwilioContentExtendMessageType {
  extendedMessagePayload?: {
    channel?: string;
    extendedMessageType: ExtendedMessageType;
    extendedMessagePayloadDetail: WhatsappTwilioContentMessageType;
  };
}

export interface WhatsappTwilioContentMessageType {
  whatsappTwilioContentApiObject?: WhatsappTwilioContentTemplateMessageType;
}

export enum ExtendedMessageType {
  WhatsappTwilioContentTemplateMessage = "TwilioContentApi",
  WhatsappCloudApiTemplateMessage = 101,
  WhatsappCloudApiInteractiveMessage = 102,
  WhatsappCloudApiContactsMessage = 103,
  WhatsappCloudApiLocationMessage = 104,
  WhatsappCloudApiReactionMessage = 105,
  WhatsappCloudApiTemplateButtonReplyMessage = 111,
  WhatsappCloudApiInteractiveReplyMessage = 112,
  WhatsappCloudApiContactsReplyMessage = 113,
  WhatsappCloudApiLocationReplyMessage = 114,
  WhatsappCloudApiOrderReplyMessage = 115,
  WhatsappCloudApiReactionReplyMessage = 116,

  FacebookOTNRequest = 201,
  FacebookOTNText = 202,
  FacebookOTNFile = 203,
  FacebookOTNInteractive = 204,
  FacebookInteractiveMessage = 205,
  InstagramInteractiveMessage = 301,
}

export interface WhatsappCloudAPIMessagePayloadType {
  whatsappCloudApiTemplateMessageObject?: WhatsappCloudAPITemplateMessageType;
  whatsappCloudApiInteractiveObject?: WhatsappInteractiveObjectType;
  whatsappCloudApiOrderObject?: WhatsappCloudAPIOrderObject;
}

export interface WhatsappTwilioContentTemplateMessageType {
  contentSid: string;
  contentVariables?: {
    [key: string]: string;
  };
  twilioContentObject?: {
    language: string;
    account_sid: string;
    url: string;
    sid: string;
    types: {
      "twilio/quick-reply"?: {
        body: string;
        actions?: Array<{
          title: string;
          id: string;
        }>;
      };
      //todo call to action
    };
    isBookmarked: boolean;
  };
}

export interface WhatsappCloudAPITemplateMessageType {
  templateName: string;
  language: string;
  components: TemplateMessageComponentType[] | undefined;
}

export interface WhatsappCloudAPIOrderItemType {
  name: string;
  image_url: string | null;
  description: string;
  product_retailer_id: string;
  quantity: number;
  item_price: number;
  currency: string;
}

export interface WhatsappCloudAPIOrderObject {
  catalog_name: string;
  product_items: WhatsappCloudAPIOrderItemType[];
  catalog_id: string;
  text: string;
}
