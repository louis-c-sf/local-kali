export type ConnectedChannelType = {
  companyId: string;
  channelName: string;
  messagingHubWabaPhoneNumberId: string;
  messagingHubWabaId: string;
  whatsappPhoneNumber: string;
  whatsappDisplayName: string;
  facebookWabaName: string;
  facebookWabaBusinessName: string;
  templateNamespace: string;
  facebookWabaBusinessVerificationStatus: string;
  facebookPhoneNumberStatus: string;
  facebookPhoneNumberQualityRating: string;
  facebookPhoneNumberNameStatus: string;
  facebookPhoneNumberNewNameStatus: string;
  facebookPhoneNumberAccountMode: string;
  facebookPhoneNumberCodeVerificationStatus: string;
  facebookPhoneNumberIsOfficialBusinessAccount: string;
  facebookPhoneNumberMessagingLimitTier: string;
  facebookPhoneNumberQualityScore: {
    reasons: string;
    score: string;
    date: string;
  };
  isOptInEnable: boolean;
  optInConfig: {
    templateName: string;
    language: string;
    templateMessageContent: string;
    readMoreTemplateButtonMessage: string;
  };
  createdAt: string;
  updatedAt: string;
  facebookProductCatalogId?: string;
  productCatalogSetting?: {
    hasEnabledProductCatalog: true;
    hasEnabledAutoSendStripePaymentUrl: true;
  };
};

export interface UnConnectedChannelType {
  messagingHubWabaId: string;
  templateNamespace: string;
  facebookWabaName: string;
  facebookWabaAccountReviewStatus: string;
  facebookWabaId: string;
  facebookWabaBusinessId: string;
  facebookWabaBusinessName: string;
  facebookWabaBusinessProfilePictureUri: string;
  facebookWabaBusinessVerificationStatus: string;
  facebookWabaBusinessVertical: string;
  wabaDtoPhoneNumbers: WebaDtoPhoneNumberType[];
  createdAt: string;
  updatedAt: string;
}
export type WebaDtoPhoneNumberType = {
  messagingHubWabaPhoneNumberId: string;
  sleekflowCompanyId: string;
  facebookPhoneNumber: string;
  facebookPhoneNumberId: string;
  facebookPhoneNumberVerifiedName: string;
  facebookPhoneNumberStatus: string;
  facebookPhoneNumberQualityRating: string;
  facebookPhoneNumberNameStatus: string;
  facebookPhoneNumberNewNameStatus: string;
  facebookPhoneNumberAccountMode: string;
  facebookPhoneNumberCodeVerificationStatus: string;
  facebookPhoneNumberIsOfficialBusinessAccount: string;
  facebookPhoneNumberMessagingLimitTier: string;
  facebookPhoneNumberQualityScore: {
    reasons: string;
    score: string;
    date: string;
  };
  createdAt: string;
  updatedAt: string;
};

export type SubmitChannelResponseType = {
  connectedWhatsappCloudApiConfig: ConnectedChannelType;
};

export type NewNumberInfoType = {
  businessAccount: string;
  phoneNumber: string;
  displayName: string;
  channelName?: string;
  businessVerificationStatus?: BusinessVerificationStatusDictEnum;
  whatsappNameStatus?: string;
  messagingLimit?: string;
  wabaId?: string;
  wabaPhoneNumberId?: string;
  facebookPhoneNumberId: string;
  facebookWabaBusinessId: string;
};

export type SelectedChannelType = {
  connected: ConnectedChannelType[];
  unconnected: UnConnectedChannelType[];
};

export const MessagingLimitMapping = {
  TIER_50: 50,
  TIER_250: 250,
  TIER_1K: 1000,
  TIER_10K: 10000,
  TIER_100K: 100000,
  TIER_UNLIMITED: "∞",
};

export const BusinessVerificationStatusDict = {
  Unknown: "unknown",
  Failed: "failed",
  Rejected: "rejected",
  Not_verified: "not_verified",
  Pending: "pending",
  Pending_need_more_info: "pending_need_more_info",
  Pending_submission: "pending_submission",
  Verified: "verified",
} as const;

type BusinessVerificationStatusDictType = typeof BusinessVerificationStatusDict;
type BusinessVerificationStatusDictKey =
  keyof BusinessVerificationStatusDictType;
export type BusinessVerificationStatusDictEnum =
  BusinessVerificationStatusDictType[BusinessVerificationStatusDictKey];

export enum WhatsappNameStatusEnum {
  Approved = "approved",
  None = "none",
  Unknown = "unknown",
}
