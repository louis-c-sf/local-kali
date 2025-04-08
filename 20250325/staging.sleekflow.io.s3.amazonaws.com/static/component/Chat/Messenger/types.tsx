import { ReactNode } from "react";

import {
  EmailConfigType,
  FacebookConfigType,
  FacebookLeadAdsConfigType,
  InstagramConfigType,
  LineConfigType,
  ShopifyConfigsType,
  SmsTwilioAPIConfigType,
  WeChatConfigType,
  WhatsApp360DialogConfigsType,
  WhatsAppChatAPIConfigType,
  WhatsAppTwilioAPIConfigType,
  ViberConfigType,
  TelegramConfigType,
} from "../../../types/CompanyType";
import { WhatsappCloudAPIConfigType } from "features/WhatsappCloudAPI/models/WhatsappCloudAPIConfigType";

export type ChannelConfigTypeMap = {
  email: EmailConfigType;
  facebook: FacebookConfigType;
  whatsapp: WhatsAppChatAPIConfigType;
  twilio_whatsapp: WhatsAppTwilioAPIConfigType;
  sms: SmsTwilioAPIConfigType;
  line: LineConfigType;
  wechat: WeChatConfigType;
  facebookLeadAds: FacebookLeadAdsConfigType;
  instagram: InstagramConfigType;
  shopify: ShopifyConfigsType;
  telegram: TelegramConfigType;
  viber: ViberConfigType;
  whatsapp360dialog: WhatsApp360DialogConfigsType;
  whatsappcloudapi: WhatsappCloudAPIConfigType;
  note: string;
  whatsappCatalog: string;
};

export const ChannelTypeList = [
  "email",
  "note",
  "whatsapp",
  "facebook",
  "instagram",
  "sms",
  "web",
  "wechat",
  "line",
  "twilio_whatsapp",
  "facebookLeadAds",
  "zapier",
  "sleekflowApi",
  "googleSheet",
  "shopify",
  "woocommerce",
  "shopline",
  "calendly",
  "whatsapp360dialog",
  "viber",
  "telegram",
  "stripe",
  "salesforce",
  "salesforceMarketingCloud",
  "make",
  "hubspot",
  "whatsappcloudapi",
  "whatsappCatalog",
] as const;

export type ChannelType = typeof ChannelTypeList[number];

export type WhatsappChannelType = Extract<
  ChannelType,
  | "whatsapp360dialog"
  | "whatsappcloudapi"
  | "twilio_whatsapp"
  | "whatsapp_twilio"
  | "whatsapp"
>;

export const ZAPIER_CHANNELS: readonly ChannelType[] = [
  "zapier",
  "googleSheet",
  "shopify",
  "calendly",
  "woocommerce",
] as const;

export interface ChannelConfiguredType<
  T extends keyof ChannelConfigTypeMap | never
> {
  name: string;
  type: T;
  configs?: ChannelConfigTypeMap[T][];
  image?: string;
}

export interface FilterBottomChildrenItemType {
  name: string;
  header: string;
  element: ReactNode;
  placeholder: string;
}
