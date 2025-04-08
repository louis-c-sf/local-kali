import { TemplateMessageComponentType } from "./MessageType";
import {
  TemplateComponentType,
  CreateTemplateCategoryEnum,
} from "features/WhatsappCloudAPI/models/WhatsappCloudAPITemplateType";

export function denormalizeWhatsappTemplateResponse(
  response: WhatsappTemplateResponseType
): Array<WhatsappTemplateNormalizedType> {
  const PENDING_STATUSES = ["pending", "received"];
  return response?.whatsapp_templates.map((wt) => {
    return {
      whatsapp_template: wt.languages,
      approvedCount: wt.languages.filter(
        (lang) => lang.status.toLowerCase() === "approved"
      ).length,
      totalCount: wt.languages.length,
      languages: wt.languages.map((lang) => lang.language),
      account_sid: wt.account_sid,
      template_name: wt.template_name,
      category: wt.category,
      sid: wt.sid,
      rejectedCount: wt.languages.filter(
        (lang) => lang.status.toLowerCase() === "rejected"
      ).length,
      isPending:
        wt.languages.filter((lang) =>
          PENDING_STATUSES.includes(lang.status.toLowerCase())
        ).length > 0 ||
        wt.languages.some(
          (lang) => lang.status.toLowerCase() === "unsubmitted"
        ),
      isBookmarked: wt?.isBookmarked ?? false,
      isContent: false,
    };
  });
}

export function denormalizeWhatsappContentTemplateResponse(
  response: WhatsappContentTemplateResponseType
): Array<WhatsappTemplateNormalizedType> {
  const getButtonComponent = (wt: WhatsappContentTemplateType) => {
    if (!wt.types["twilio/call-to-action"] && !wt.types["twilio/quick-reply"])
      return [];
    const buttons =
      wt.types["twilio/call-to-action"]?.actions ||
      wt.types["twilio/quick-reply"]?.actions ||
      [];
    return [
      {
        type: wt.types["twilio/call-to-action"]
          ? "CALL_TO_ACTION"
          : "QUICK_REPLY",
        buttons: buttons.map(({ title, ...rest }) => ({
          ...rest,
          text: title,
          type: wt.types["twilio/call-to-action"]
            ? "CALL_TO_ACTION"
            : "QUICK_REPLY",
        })),
      },
    ];
  };
  return response?.contents?.map((wt) => ({
    whatsapp_template: [
      {
        content:
          (
            wt.types["twilio/text"] ||
            wt.types["twilio/call-to-action"] ||
            wt.types["twilio/quick-reply"]
          )?.body || "",
        date_created: wt.date_created,
        date_updated: wt.date_updated,
        language: wt.language,
        rejection_reason: wt.approval_requests.rejection_reason,
        status: wt.approval_requests.status,
        components: getButtonComponent(wt),
      },
    ],
    approvedCount:
      wt.approval_requests.status.toLowerCase() === "approved" ? 1 : 0,
    totalCount: 1,
    languages: [wt.language],
    account_sid: wt.sid,
    template_name: wt.friendly_name,
    category: wt.approval_requests.category,
    sid: wt.sid,
    rejectedCount:
      wt.approval_requests.status.toLowerCase() === "rejected" ? 1 : 0,
    isPending: ["unsubmitted", "pending"].includes(
      wt.approval_requests.status.toLowerCase()
    ),
    isBookmarked: wt.isBookmarked,
    isContent: true,
  }));
}

export const QUICK_REPLY_TYPE = "QUICK_REPLY";
export const CALL_TO_ACTION_TYPE = "CALL_TO_ACTION";
export const NONE_TYPE = "NONE";
export const ALLOWED_ADD_BUTTONS_TYPE = [QUICK_REPLY_TYPE, CALL_TO_ACTION_TYPE];
export type buttonTypeEnum = "QUICK_REPLY" | "CALL_TO_ACTION" | "NONE";

export function normalizeWhatsappTemplateRequest(
  templateInfo: TemplateInfoType
): WhatsappTemplateRequestType {
  const languages: Array<LanguageRequestType> = templateInfo.content.map(
    (c) => {
      let components: Array<WhatsappTemplateComponentType> = [];
      if (
        ALLOWED_ADD_BUTTONS_TYPE.includes(templateInfo.buttonType) &&
        c.buttons
      ) {
        components = [
          {
            type: "BUTTONS",
            buttons: c.buttons.map((button) => {
              let buttonParam: WhatsappTemplateComponentButtonType = {
                type: button.type,
                text: button.text,
              };
              if (button.phone_number) {
                buttonParam = {
                  ...buttonParam,
                  phone_number: button.phone_number,
                };
              }
              if (button.url) {
                buttonParam = {
                  ...buttonParam,
                  url: button.url,
                };
              }
              return {
                ...buttonParam,
                type: buttonParam.type.toUpperCase(),
              };
            }),
          },
        ];
      }
      return {
        status: "unsubmitted",
        language: c.lang,
        content: c.content.trim(),
        components,
      };
    }
  );
  return {
    name: templateInfo.templateName,
    category: templateInfo.category,
    languages,
  };
}

export type CategoryEnum =
  | "ACCOUNT_UPDATE"
  | "ALERT_UPDATE"
  | "APPOINTMENT_UPDATE"
  | "AUTO_REPLY"
  | "ISSUE_RESOLUTION"
  | "PAYMENT_UPDATE"
  | "PERSONAL_FINANCE_UPDATE"
  | "RESERVATION_UPDATE"
  | "SHIPPING_UPDATE"
  | "TICKET_UPDATE"
  | "TRANSPORTATION_UPDATE";

interface WhatsappTemplateRequestType {
  name: string;
  category: CategoryEnum;
  languages: Array<LanguageRequestType>;
}

interface LanguageRequestType {
  status: string;
  language: string;
  content: string;
  components?: Array<WhatsappTemplateComponentType>;
}

export interface TemplateInfoType {
  templateName: string;
  category: CategoryEnum;
  buttonType: buttonTypeEnum;
  content: Array<ContentLingual>;
}

export interface ContentLingual {
  content: string;
  lang: string;
  status?: StatusEnum;
  rejection_reason?: string;
  buttons?: Array<WhatsappTemplateComponentButtonType>;
}

export interface WhatsappContentTemplateResponseType {
  meta?: { next_page_url: string };
  contents: Array<WhatsappContentTemplateType>;
}
export interface WhatsappContentTemplateType
  extends WhatsappContentTemplateDataType {
  approval_requests: WhatsappContentTemplateApprovalType;
  sid: string;
  account_sid: string;
  date_created: string;
  date_updated: string;
  isBookmarked: boolean;
}

export interface WhatsappContentTemplateCreateType
  extends WhatsappContentTemplateDataType {
  category: CreateTemplateCategoryEnum;
}

interface WhatsappContentTemplateDataType {
  types: {
    [key in ContentTypeEnum]?: {
      body: string;
      actions?: WhatsappContentTemplateButtonType[];
    };
  };
  language: string;
  variables?: {
    [key: string]: string;
  };
  friendly_name: string;
}

interface WhatsappContentTemplateButtonType {
  title: string;
  id?: string;
  type: string;
  url?: string;
  phone?: string;
}
const ContentTypeList = [
  "twilio/text",
  "twilio/media",
  "twilio/location",
  "twilio/list-picker",
  "twilio/call-to-action",
  "twilio/quick-reply",
  "twilio/card",
] as const;

export type ContentTypeEnum = typeof ContentTypeList[number];
export interface WhatsappContentTemplateApprovalType {
  category: "MARKETING" | "AUTHENTICATION" | "UTILITY";
  status: StatusEnum;
  name: string;
  allow_category_change: boolean;
  content_type: ContentTypeEnum;
  rejection_reason: string;
}

export interface WhatsappTemplateResponseType {
  meta?: { next_page_url: string };
  whatsapp_templates: Array<WhatsappTemplateType>;
}

export type StatusEnum = "approved" | "rejected" | "pending" | "unsubmitted";

export interface WhatsappTemplateType {
  account_sid: string;
  category: CategoryEnum;
  languages: Array<WhatsappTemplateContentLanguageType>;
  sid: string;
  template_name: string;
  url: string;
  isBookmarked?: boolean;
}

export interface WhatsappGenericNormalizedType {
  languages: string[];
  approvedCount: number;
  totalCount: number;
  rejectedCount: number;
  isBookmarked: boolean;
  template_name: string;
  callbacks?: WhatsappTemplateCallbackActionType[];
}

export interface WhatsappTemplateNormalizedType
  extends WhatsappGenericNormalizedType {
  category: CategoryEnum | CreateTemplateCategoryEnum;
  account_sid: string;
  whatsapp_template: Array<WhatsappTemplateContentLanguageType>;
  sid: string;
  isPending: boolean;
  isContent?: boolean;
}

export interface WhatsappTemplateContentLanguageType {
  content: string;
  date_created: string;
  date_updated: string;
  language: string;
  rejection_reason?: string;
  status: StatusEnum;
  components?: Array<WhatsappTemplateComponentType>;
}

export interface WhatsappTemplateComponentType {
  type: string;
  buttons: Array<WhatsappTemplateComponentButtonType>;
}

export interface WhatsappTemplateComponentButtonType {
  type: string;
  text: string;
  url?: string;
  phone_number?: string;
}

export type WhatsappTemplateCallbackActionType = {
  quickReplyButtonIndex: number;
  webhookUrl: string;
  type: "webhook";
};

export const LanguagesMapping = Object.freeze([
  { label: "Afrikaans", value: "af" },
  { label: "Albanian", value: "sq" },
  { label: "Arabic", value: "ar" },
  { label: "Azerbaijani", value: "az" },
  { label: "Bengali", value: "bn" },
  { label: "Bulgarian", value: "bg" },
  { label: "Catalan", value: "ca" },
  { label: "Chinese (CHN)", value: "zh_CN" },
  { label: "Chinese (HKG)", value: "zh_HK" },
  { label: "Chinese (TAI)", value: "zh_TW" },
  { label: "Croatian", value: "hr" },
  { label: "Czech", value: "cs" },
  { label: "Danish", value: "da" },
  { label: "Dutch", value: "nl" },
  { label: "English", value: "en" },
  { label: "English (UK)", value: "en_GB" },
  { label: "English (US)", value: "en_US" },
  { label: "Estonian", value: "et" },
  { label: "Filipino", value: "fil" },
  { label: "Finnish", value: "fi" },
  { label: "French", value: "fr" },
  { label: "German", value: "de" },
  { label: "Greek", value: "el" },
  { label: "Gujarati", value: "gu" },
  { label: "Hebrew", value: "he" },
  { label: "Hindi", value: "hi" },
  { label: "Hungarian", value: "hu" },
  { label: "Indonesian", value: "id" },
  { label: "Irish", value: "ga" },
  { label: "Italian", value: "it" },
  { label: "Japanese", value: "ja" },
  { label: "Kannada", value: "kn" },
  { label: "Kazakh", value: "kk" },
  { label: "Korean", value: "ko" },
  { label: "Lao", value: "lo" },
  { label: "Latvian", value: "lv" },
  { label: "Lithuanian", value: "lt" },
  { label: "Macedonian", value: "mk" },
  { label: "Malay", value: "ms" },
  { label: "Marathi", value: "mr" },
  { label: "Norwegian", value: "nb" },
  { label: "Persian", value: "fa" },
  { label: "Polish", value: "pl" },
  { label: "Portuguese (BR)", value: "pt_BR" },
  { label: "Portuguese (POR)", value: "pt_PT" },
  { label: "Punjabi", value: "pa" },
  { label: "Romanian", value: "ro" },
  { label: "Russian", value: "ru" },
  { label: "Serbian", value: "sr" },
  { label: "Slovak", value: "sk" },
  { label: "Slovenian", value: "sl" },
  { label: "Spanish", value: "es" },
  { label: "Spanish (ARG)", value: "es_AR" },
  { label: "Spanish (SPA)", value: "es_ES" },
  { label: "Spanish (MEX)", value: "es_MX" },
  { label: "Swahili", value: "sw" },
  { label: "Swedish", value: "sv" },
  { label: "Tamil", value: "ta" },
  { label: "Telugu", value: "te" },
  { label: "Thai", value: "th" },
  { label: "Turkish", value: "tr" },
  { label: "Ukrainian", value: "uk" },
  { label: "Urdu", value: "ur" },
  { label: "Uzbek", value: "uz" },
  { label: "Vietnamese", value: "vi" },
]);

export interface Whatsapp360DialogTemplatesResponse {
  total: number;
  offset: number;
  count: number;
  whatsAppTemplates: Array<Whatsapp360DialogTemplateResponse>;
}

export type ComponentType =
  | HeaderComponentType
  | BodyComponentType
  | FooterComponentType
  | ButtonComponentType;

export interface Whatsapp360DialogTemplateResponse {
  isTemplateBookmarked: boolean;
  name: string;
  status: StatusEnum;
  language: string;
  category: CategoryEnum;
  components: Array<ComponentType>;
  rejected_reason: string;
  namespace: string;
}

export interface ButtonComponentType {
  type: "BUTTONS";
  buttons: Array<WhatsappTemplateComponentButtonType>;
}

export interface BodyComponentType {
  type: "BODY";
  text: string;
}

export enum HeaderFormatEnum {
  IMAGE = "IMAGE",
  DOCUMENT = "DOCUMENT",
  TEXT = "TEXT",
  VIDEO = "VIDEO",
}

export interface HeaderComponentType {
  type: "HEADER";
  format: HeaderFormatEnum;
  text?: string;
}

export interface FooterComponentType {
  type: "FOOTER";
  text: string;
}

export function isHeaderType(
  component:
    | ComponentType
    | TemplateMessageComponentType
    | TemplateComponentType
    | undefined
): component is HeaderComponentType | undefined {
  return component?.type.toUpperCase() === "HEADER";
}

export function isFooterType(
  component: ComponentType | TemplateComponentType | undefined
): component is FooterComponentType | undefined {
  return component?.type === "FOOTER";
}

export function isBodyType(
  component:
    | ComponentType
    | TemplateMessageComponentType
    | TemplateComponentType
): component is BodyComponentType {
  return component.type.toUpperCase() === "BODY";
}

export function isButtonType(
  component: ComponentType | TemplateComponentType | undefined
): component is ButtonComponentType | undefined {
  return component?.type === "BUTTONS";
}

export const isWhatsappTemplateNormalizedType = (
  t: any
): t is WhatsappTemplateNormalizedType => {
  return !!t.sid;
};
