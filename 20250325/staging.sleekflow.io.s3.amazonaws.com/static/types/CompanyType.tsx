import TimeZoneInfoType from "./TimeZoneInfoType";
import {
  ProfilePictureType,
  WhatsApp360DialogByWabaIdConfigs,
} from "./LoginType";
import { PlanType } from "./PlanSelectionType";
import { HashTagCountedType } from "./ConversationType";
import { StaffType } from "./StaffType";
import { WhatsappAccessLevel } from "../component/CreateWhatsappFlow/WhatsappAccessLabel";
import { InboxOrderDictEnum } from "./state/InboxStateType";
import { CrmConfigType } from "core/features/Crm/API/Onboarding/contracts";
import { WhatsappCloudAPIConfigType } from "features/WhatsappCloudAPI/models/WhatsappCloudAPIConfigType";
import { PaymentLinkSettingType } from "features/Ecommerce/Payment/usecases/Settings/Catalog/types";

export interface WhatsAppwabaResponseType {
  whatsApp360DialogByWabaIdConfigs: Array<WhatsApp360DialogByWabaIdConfigs>;
}
export interface WhatsAppCloudAPIResponseType {
  whatsappCloudApiByWabaIdConfigs: Array<WhatsAppCloudAPIByWabaIdConfigType>;
}
export function isWhatsApp360DialogConfigsType(
  x: any
): x is WhatsApp360DialogByWabaIdConfigs {
  return x.whatsApp360DialogConfigs !== undefined;
}

export interface WhatsAppCloudAPIByWabaIdConfigType {
  wabaAccountId: string;
  templateNamespace: string;
  wabaName: string;
  facebookWabaBusinessId: string;
  facebookWabaId: string;
  whatsappCloudApiConfigs: Array<WhatsappCloudAPIConfigType>;
  isOptInEnable: boolean;
  optInConfig: {
    templateName: string;
    language: string;
    templateMessageContent: string;
    readMoreTemplateButtonMessage: string;
  };
}
export interface CompanyCustomFieldsType {
  fieldName: string;
  companyCustomFieldFieldLinguals: CustomUserProfileFieldLingualsType[];
  companyCustomFieldFieldOptions?: UserProfileFieldOptionsType[];
  value: string;
  category: string;

  isVisible: boolean;
  isEditable: boolean;
  type: string;
  order?: number;
}

export interface CustomUserProfileFieldsType {
  id: string;
  fieldName: string;
  customUserProfileFieldLinguals: CustomUserProfileFieldLingualsType[];
  customUserProfileFieldOptions?: UserProfileFieldOptionsType[];
  type: string;
  order: number;
  isDefault: boolean;
  isDeletable: boolean;
  isVisible: boolean;
  isEditable: boolean;
  fieldsCategory?: "Shopify" | string;
}

export interface UserProfileFieldOptionsType {
  id: number;
  customUserProfileFieldOptionLinguals: CustomUserProfileFieldLingualsType[];
  value: string;
  order: number;
}

export interface CustomUserProfileFieldLingualsType {
  language: string;
  displayName: string;
}

export interface MayHaveChannelIdentity {
  channelIdentityId?: string;
}

export interface HasChannelIdentity {
  channelIdentityId: string;
}

export interface WeChatConfigType extends HasChannelIdentity {
  webChatId: string;
  appId: string;
  name?: string;
}

export interface WhatsAppChatAPIConfigType extends HasChannelIdentity {
  companyId: string;
  connectedDateTime: string;
  createdAt: string;
  expireDate: string;
  isConnected: boolean;
  isShowInWidget: boolean;
  isSubscribed: boolean;
  isTrial: boolean;
  lastSyncedAt: string;
  lastRebootedAt: string;
  isBeta: boolean;
  name: string;
  status: string;
  subscribedDate: string;
  whatsAppSender: string;
  wsChatAPIInstance: string;
}

export interface FacebookStatusType {
  connectedDateTime: string;
  isShowInWidget: boolean;
  pageId: string;
  pageName: string;
  status: "Authenticated" | "Invalid";
}

export interface FacebookConfigType extends HasChannelIdentity {
  pageId: string;
  pageName: string;
  connectedDateTime: string;
}

export interface EmailConfigType extends HasChannelIdentity {
  domain: string;
  email: string;
  isShowInWidget: boolean;
  connectedDateTime: string;
}

export interface BillRecordsType {
  id: number;
  companyId: string;
  subscriptionPlan: PlanType;
  periodStart: string;
  periodEnd: string;
  status: number;
  paymentStatus: number;
  purchaseStaff: StaffType;
  invoice_Id: string;
  stripe_subscriptionId: string;
  customerId: string;
  customer_email: string;
  hosted_invoice_url: string;
  invoice_pdf: string;
  chargeId: string;
  payAmount: number;
  amount_due: number;
  amount_paid: number;
  amount_remaining: number;
  currency: string;
  created: string;
  isFreeTrial: boolean;
}

export interface SmsTwilioAPIConfigType extends HasChannelIdentity {
  twilioAccountId: string;
  smsSender: string;
  connectedDateTime: string;
  name: string;
}

export interface WhatsAppTwilioAPIConfigType extends HasChannelIdentity {
  twilioAccountId: string;
  whatsAppSender: string;
  connectDateTime: string;
  name: string;
  readMoreTemplateId?: string;
  readMoreTemplateMessage?: string;
  isSubaccount: boolean;
}

export interface LineConfigType extends HasChannelIdentity {
  basicId: string;
  channelID: string;
  connectedDateTime: string;
  name?: string;
}

export interface FacebookLeadAdsConfigType {
  //todo add HasChannelIdentity ?
  connectedDateTime: string;
  pageId: string;
  pageName: string;
  isShowInWidget: boolean;
}

export interface TwilioUsageRecordType {
  balance: number;
  companyId: string;
  currency: string;
  description: string;
  end: string;
  id: number;
  start: string;
  totalCreditValue: number;
  totalPrice: number;
  twilioAccountId: string;
}

export interface WhatsApp360DialogUsageRecordType {
  balance: number;
  createdAt: string;
  credit: number;
  currency: string;
  id: number;
  partnerId: string;
  pendingCharges: number;
  upcomingCharges: number;
  updatedAt: string;
  used: number;
  allTimeUsage: number;
  waba360DialogClientCreatedAt: string;
  waba360DialogClientId: string;
  waba360DialogClientName: string;
  markupPrice: number;
  markupPercentage: number;
  currentConversationPeriodUsage: {
    billingPeriod: string;
    businessInitiatedPaidQuantity: number;
    businessInitiatedPrice: number;
    businessInitiatedQuantity: number;
    freeEntryPoint: number;
    freeQuantity: number;
    freeTier: number;
    paidQuantity: number;
    periodDate: string;
    quantity: number;
    totalPrice: number;
    userInitiatedPaidQuantity: number;
    userInitiatedPrice: number;
    userInitiatedQuantity: number;
  };
  currentPhoneNumberPeriodUsage: {
    billingPeriod: string;
    channelIds: string[];
    chargeablePhoneNumberQuantity: number;
    currency: string;
    unitPrice: number;
    updatedAt: string;
  };
}

export interface InstagramConfigType extends HasChannelIdentity {
  connectedDateTime: string;
  instagramPageId: string;
  isShowInWidget: boolean;
  name: string;
  pageName: string;
  status: string;
}
type ShopifySupportedCountryType = {
  countryName: string;
  countryCode: string;
};
export interface ShopifyConfigsType {
  id: number;
  name: string;
  usersMyShopifyUrl: string;
  accessToken: string;
  createdAt: string;
  lastUpdatedAt: string;
  currency: string;
  isShopifySubscriptionPaid: boolean;
  status: "Connected" | "Disconnected" | "Syncing";
  isShowInInbox: boolean;
  billRecord?: BillRecordsType;
  supportedCountries: ShopifySupportedCountryType[];
  paymentLinkSetting?: PaymentLinkSettingType;
}

export interface TelegramConfigType extends HasChannelIdentity {
  id: number;
  displayName: string;
  telegramBotId: number;
  telegramBotDisplayName: string;
  telegramBotUserName: string;
  connectedDateTime: string;
  isShowInWidget: boolean;
  telegramDeeplink: string;
}

export interface WhatsApp360DialogConfigsType extends HasChannelIdentity {
  id: number;
  channelId: string;
  accountMode: string;
  channelName: string;
  channelStatus: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  whatsAppBusinessApiAccountStatus: string;
  whatsAppChannelSetupName: string;
  whatsAppPhoneNumber: string;
  wabaAccountId: string;
  wabaStatus: string;
  accessLevel: WhatsappAccessLevel;
  isOptInEnable: boolean;
  optInConfig?: WhatsApp360DialogOptInConfigType;
  isClient: boolean;
}

export interface ViberConfigType extends HasChannelIdentity {
  id: number;
  displayName: string;
  viberBotId: string;
  viberBotName: string;
  uri: string;
  iconUrl: string;
  connectedDateTime: string;
  isShowInWidget: true;
  viberDeeplink: string;
}

export enum SleekflowCompanyType {
  RegularClient = 0,
  Reseller,
  ResellerClient,
}

export interface PlanAddOnStatus {
  isAdditionalContactsEnabled: boolean;
  isUnlimitedContactEnabled: boolean;
  isEnterpriseContactMaskingEnabled: boolean;
  isWhatsappQrCodeEnabled: boolean;
  isShopifyIntegrationEnabled: boolean;
  isHubspotIntegrationEnabled: boolean;
  isPaymentIntegrationEnabled: boolean;
  isSalesforceCrmEnabled: boolean;
  isSalesforceMarketingCloudEnabled: boolean;
  isSalesforceCommerceCloudEnabled: boolean;
  isOnboardingSupportActivated: boolean;
  isPrioritySupportActivated: boolean;
  isChatbotSetupSupportActivated: boolean;
  isUnlimitedChannelEnabled: boolean;
  isAdditionalStaffEnabled: boolean;
  isAdditionalStaffFreeTrialEligible: boolean;
  isHubspotIntegrationFreeTrialEligible: boolean;
  isSalesforceCrmFreeTrialEligible: boolean;
}

export default interface CompanyType {
  billRecords: BillRecordsType[];
  companyCountry: string;
  companyCustomFields: Array<CompanyCustomFieldsType>;
  companyHashtags: Array<HashTagCountedType>;
  companyIconFile?: ProfilePictureType;
  companyIconFileURL?: string;
  companyName: string;
  createdAt: string;
  currentAgents: number;
  enableSensitiveSetting: boolean;
  customUserProfileFields: Array<CustomUserProfileFieldsType>;
  id: string;
  isSubscriptionActive: boolean;
  addonStatus?: PlanAddOnStatus;
  maximumAgents: number;
  maximumWhatsappInstance: number;
  purchasedChatAPIInstance: number;
  maximumAutomations: number;
  signalRGroupName: string;
  timeZoneInfo: TimeZoneInfoType;
  isFreeTrial: boolean;
  leadAdsFacebookConfigs?: FacebookLeadAdsConfigType[];
  emailConfig?: EmailConfigType;
  facebookConfigs?: FacebookConfigType[];
  lineConfigs?: LineConfigType[];
  smsConfigs?: SmsTwilioAPIConfigType[];
  weChatConfig?: WeChatConfigType;
  whatsAppConfigs?: WhatsAppTwilioAPIConfigType[];
  wsChatAPIConfigs?: WhatsAppChatAPIConfigType[];
  twilioUsageRecords?: TwilioUsageRecordType[];
  purchasedWhatsAppPhoneNumber: number;
  instagramConfigs?: InstagramConfigType[];
  whatsApp360DialogConfigs?: WhatsApp360DialogConfigsType[];
  viberConfigs?: ViberConfigType[];
  telegramConfigs?: TelegramConfigType[];
  whatsApp360DialogUsageRecords?: WhatsApp360DialogUsageRecordType[];
  isExceededTwilioDailyLimit: boolean;
  isPaymentFailed: boolean;
  shopifyConfigs?: ShopifyConfigsType[];
  isSandbox: boolean;
  isShopifyAccount: boolean;
  isQRCodeMappingEnabled?: boolean;
  companyType: SleekflowCompanyType;
  reseller?: {
    companyName: string;
    companyProfileId: string;
    contactEmail: string;
    logoLink: string;
  };
  defaultInboxOrder: InboxOrderDictEnum;
  isStripePaymentEnabled: boolean;
  crmHubProviderConfigs?: CrmConfigType[];
  blastMessageConfig: BlastMessageConfigType | null;
  whatsappCloudApiConfigs?: WhatsappCloudAPIConfigType[];
  whatsappCloudApiUsageRecords?: WhatsappCloudApiUsageRecordType[];
  isStripeIntegrationEnabled: boolean;
  isGlobalPricingFeatureEnabled?: boolean;
}

export interface WhatsappCloudApiUsageRecordType {
  facebook_business_id: string;
  facebook_business_name: string;
  facebook_business_wabas: FacebookBusinessWabaType[];
  total_used: CloudAPIBalanceType;
  total_credit: CloudAPIBalanceType;
  all_time_usage: CloudAPIBalanceType;
  balance: CloudAPIBalanceType;
}
interface CloudAPIBalanceType {
  currency_iso_code: string;
  amount: number;
}

export interface FacebookBusinessWabaType {
  facebook_waba_id: string;
  facebook_waba_name: string;
}

export interface WhatsApp360DialogOptInConfigType {
  templateMessageContent?: string;
  language: string;
  readMoreTemplateButtonMessage: string;
  templateName: string;
  templateNamespace: string;
}

type BlastMessageConfigType = {
  id: string;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
};
