import type {
  SleekflowApisTicketingHubModelTicketDto,
  TravisBackendTicketingHubDomainViewModelsGetSchemafulTicketDto,
} from '@sleekflow/sleekflow-core-typescript-rxjs-apis';
import * as yup from 'yup';

import type { GetUserProfileCondition } from '@/api/userProfile';
import type { TemplateCategoryType } from '@/components/whatsapp-templates/types';
import {
  AvailableSubscribePlanName,
  SubscriptionPeriod,
} from '@/constants/subscription-plans';
import type { ChannelConnectRowType } from '@/pages/Channels/shared/ChannelConnectDashboardTable';
import type {
  TransformedLinguals,
  TransformedUserProfileOptions,
} from '@/pages/Contacts/shared/types';
import {
  MessageType,
  OpenGraphData,
  PaymentBreakdown,
} from '@/pages/Inbox/types';
import type { FilterRulesConfig, RuleOptionsValues } from '@/utils/rules';

import type { UserStatusType } from './company';
import type {
  TemplateApprovalStatusAllKey,
  TemplateButtonTypeKey,
  TemplateCategoryTypeKey,
  TemplateLanguageOptionKey,
} from './template';

export type LegacyApiResponseTemplate<TData> = {
  success: boolean;
  data: TData;
  date_time: Date;
  message?: string;
  http_status_code: number;
  request_id: string;
  error_code?: number;
};

export type ApiSuccessResponseTemplate<TData> = {
  success: true;
  data: TData;
  date_time: Date;
  http_status_code: number;
  request_id: string;
};

export type ApiErrorResponseTemplate<TError = Record<string, unknown>> = {
  success: false;
  date_time: Date;
  http_status_code: number;
  error_code: number;
  error_context: TError;
  request_id: string;
  message: string;
};

export const isApiErrorResponseTemplate = (
  error: unknown,
): error is ApiErrorResponseTemplate => {
  const schema = yup.object({
    success: yup.boolean().required(),
    date_time: yup.date().required(),
    http_status_code: yup.number().min(400).required(),
    error_code: yup.number().required(),
    request_id: yup.string().required(),
  });

  return schema.isValidSync(error, { stripUnknown: false });
};

export const AUTOMATION_TYPES = {
  assignment: 'Assignment',
  fieldValueChanged: 'FieldValueChanged',
  messageReceived: 'MessageReceived',
  recurringJob: 'RecurringJob',
  scheduledJob: 'ScheduledJob',
  contactAdded: 'ContactAdded',
  webhookTrigger: 'WebhookTrigger',
  newContactMessage: 'NewContactMessage',
  shopifyNewCustomerTrigger: 'ShopifyNewCustomerTrigger',
  shopifyNewOrUpdatedOrderTrigger: 'ShopifyNewOrUpdatedOrderTrigger',
  shopifyNewAbandonedCart: 'ShopifyNewAbandonedCart',
  qrCodeAssigneeMapping: 'QRCodeAssigneeMapping',
  facebookNewLeadgen: 'FacebookNewLeadgen',
  qrCodeAssignTeamMapping: 'QRCodeAssignTeamMapping',
  zapierContactUpdated: 'ZapierContactUpdated',
  shopifyUpdatedCustomerTrigger: 'ShopifyUpdatedCustomerTrigger',
  facebookPostComment: 'FacebookPostComment',
  instagramMediaComment: 'InstagramMediaComment',
  facebookIcebreaker: 'FacebookIcebreaker',
  instagramIcebreaker: 'InstagramIcebreaker',
  crmHubOnEntityCreated: 'CrmHubOnEntityCreated',
  crmHubOnEntityFieldsChanged: 'CrmHubOnEntityFieldsChanged',
  facebookLiveComment: 'FacebookLiveComment',
  instagramLiveComment: 'InstagramLiveComment',
  crmHubContactUpdated: 'CrmHubContactUpdated',
  zapierNewIncomingMessage: 'ZapierNewIncomingMessage',
  outgoingMessageTrigger: 'OutgoingMessageTrigger',
} as const;
type AutomationType = (typeof AUTOMATION_TYPES)[keyof typeof AUTOMATION_TYPES];

export enum RoleType {
  ADMIN = 'Admin',
  TEAMADMIN = 'TeamAdmin',
  STAFF = 'Staff',
}

export enum RbacDefaultRole {
  SUPER_ADMIN = 'SuperAdmin',
  ADMIN = RoleType.ADMIN,
  TEAM_ADMIN = RoleType.TEAMADMIN,
  STAFF = RoleType.STAFF,
}

export interface RbacRole {
  role_id: string;
  role_name: RbacDefaultRole | string;
  is_default: boolean;
}

export interface AssignmentRuleCondition {
  containHashTag: string;
  fieldName: string;
  conditionOperator: number;
  values: string[];
  timeValueType: number;
  nextOperator: number;
  companyMessageTemplateId: string;
  broadcastMessageStatus: number;
}

export interface AssetConfig {
  id: string;
  link: string;
  caption: string;
  filename: string;
  provider: {
    name: string;
    type: string;
    config: {
      basic: string;
      bearer: string;
    };
  };
}

export interface ActionButton {
  type: string; // could be enum
  reply: {
    id: string;
    title: string;
  };
}

export interface Whatsapp360DialogInteractiveObject {
  type: string; // could be enum
  header: {
    type: string; // could be enum
    text: string;
    video: AssetConfig;
    image: AssetConfig;
    document: AssetConfig;
  };
  body: {
    text: string;
  };
  footer: {
    text: string;
  };
  action: {
    button: string;
    buttons: ActionButton[];
    sections: {
      title: string;
      product_items: {
        product_retailer_id: string;
      }[];
      rows: {
        id: string;
        title: string;
        description: string;
      }[];
    }[];
    catalog_id: string;
    product_retailer_id: string;
  };
}

export interface Whatsapp360DialogExtendedAutomationMessage {
  wabaAccountId: string;
  messageType: string;
  whatsapp360DialogTemplateMessage: {
    templateNamespace: string;
    templateName: string;
    language: string; // could be enum
    components: {
      type: string; // could be enum
      sub_type: string; // could be enum
      index: number;
      parameters: {
        type: string; // could be enum
        text: string;
        payload: string;
        image: AssetConfig;
        audio: AssetConfig;
        document: AssetConfig;
        video: AssetConfig;
        currency: {
          currency_code: string;
          amount_1000: number;
        };
        date_time: {
          component: {
            day_of_week: number;
            year: number;
            month: number;
            day_of_month: number;
            hour: number;
            minute: number;
            calendar: string;
          };
          unix_epoch: {
            timestamp: number;
          };
        };
      }[];
    }[];
  };
  whatsapp360DialogInteractiveObject: Whatsapp360DialogInteractiveObject;
}

export interface HashtagSummary {
  hashtagId: string;
  hashtag: string;
  count: number;
}

export interface ConversationHashtag extends HashtagSummary {
  hashTagColor: number;
  hashTagType: number;
  color: Exclude<TransformedHashtagColors, 'yellow'> | 'mustard';
}

export interface AutomationAction {
  id: number;
  automatedTriggerType: number;
  assignmentType: number;
  teamAssignmentType: number;
  staffId: string;
  teamId: number;
  addAdditionalAssigneeIds: string[];
  targetedChannelWithIds: {
    channel: string;
    ids: string[];
  }[];
  messageContent: string;
  whatsApp360DialogExtendedAutomationMessages: Whatsapp360DialogExtendedAutomationMessage[];
  messageParams: string[];
  actionWaitDays: number;
  actionWait: string;
  actionRemoveFromGroupIds: number[];
  actionAddedToGroupIds: number[];
  actionUpdateCustomFields: {
    customFieldId: string;
    customFieldName: string;
    customValue: string;
  }[];
  actionAddConversationHashtags: ConversationHashtag[];
  actionAddConversationRemarks: {
    remarks: string;
  }[];
  changeConversationStatus: {
    status: string;
    snoozeOptions: number;
    snoozeUntil: string; // stringified date
  };
  webhookURL: string;
  assignedTeamIds: number[];
  order: number;
  dialogflowServiceAccountConfigId: number;
  dialogflowLanguageCode: string;
  fbIgAutoReply: {
    fbIgAutoReplyId: string;
    messageContent: string;
    messageFormat: number;
    likeComment: boolean;
    messageAttachment: MessageAttachment;
    quickReplyButtons: {
      content_type: string;
      title: string;
      payload: string;
      image_url: string;
    }[];
  };
}

export interface MessageAttachment {
  type: string;
  payload: {
    template_type: string;
    elements: {
      title: string;
      image_url: string;
      subtitle: string;
      default_action: {
        type: string;
        url: string;
        webview_height_ratio: string;
      };
      buttons: {
        type: string;
        url: string;
        title: string;
        payload: string;
      }[];
    }[];
    is_reusable: boolean;
    url: string;
    text: string;
    buttons: {
      type: string;
      url: string;
      title: string;
      payload: string;
    }[];
  };
}

export interface AssignmentRule {
  companyId: string;
  assignmentId: string;
  assignmentRuleName: string;
  automationType: AutomationType;
  assignmentType: string;
  targetedChannels: string[];
  targetedChannelWithIds: {
    channel: string;
    ids: string[];
  }[];
  conditions: AssignmentRuleCondition[];
  order: number;
  createdAt: string;
  updatedAt: string;
  automationActions: AutomationAction[];
  status: 'Draft' | 'Live';
  isDefault: boolean;
  isContinue: boolean;
  triggeredCounter: number;
  triggeredSuccessCounter: number;
  triggeredFailedCounter: number;
  isPreview: boolean;
}

export interface CustomField {
  companyDefinedFieldId: string;
  value: string;
}

export const TRANSFORMED_HASHTAG_COLORS = [
  'blue',
  'brown',
  'mustard',
  'forest',
  'red',
  'purple',
  'gray',
  'indigo',
] as const;

export type TransformedHashtagColors =
  (typeof TRANSFORMED_HASHTAG_COLORS)[number];

export const HASHTAG_COLOR_OPTIONS = [
  'Blue',
  'Pink',
  'Yellow',
  'Green',
  'Red',
  'Purple',
  'Grey',
  'Cyan',
] as const;

export type HashtagColorOptionsType = (typeof HASHTAG_COLOR_OPTIONS)[number];

export const hashtagSchema = yup.object({
  hashTagColor: yup.string(),
  hashTagType: yup.string().required(),
  hashtag: yup.string().required(),
  hashtagNormalized: yup.string(),
  id: yup.string().required(),
});

export const isHashtagsArray = (elem: unknown): elem is Hashtag[] => {
  const schema = yup.array().of(hashtagSchema);

  return schema.isValidSync(elem, { stripUnknown: false });
};

export const HASHTAG_TYPE = ['Normal', 'Shopify', 'Facebook'] as const;

export type HashtagType = (typeof HASHTAG_TYPE)[number];

export interface Hashtag {
  hashTagColor: HashtagColorOptionsType;
  hashTagType: HashtagType;
  hashtag: string;
  hashtagNormalized?: string;
  id: string;
}

export const isUserProfileContactListArray = (
  elem: unknown,
): elem is UserProfileContactList[] => {
  const schema = yup.array().of(
    yup
      .object({
        id: yup.number().required(),
        listName: yup.string().required(),
      })
      .noUnknown(),
  );

  return schema.isValidSync(elem, { stripUnknown: false });
};

export interface UserProfileContactList {
  id: number;
  listName: string;
}

export type UserProfileInner = UserprofileChannels & {
  /**
   * @deprecated Don't trust this email field, returns wrong value
   * after mutation (maybe cache) and doesn't return in response
   * payload after mutation either. Find field from customFields instead
   */
  emailAddress: {
    email: string;
    locale: 'en' | 'zh-hk' | 'zh-cn';
  };

  displayName: string;
  contactLists: UserProfileContactList[];
  conversationHashtags?: Hashtag[];
  conversationId?: string;
  createdAt: string; // stringified date
  customFields: CustomField[];
  firstName: string;
  lastName: string;
  id: string;
  isSandBox: boolean;
  isShopifyProfile: boolean;
  lastContact: string;
  displayProfilePicture?: string;
  updatedAt: string; // stringified date
  collaborators: Collaborator[];
};

const collaboratorSchema = yup.object({
  firstName: yup.string().nullable(),
  lastName: yup.string().nullable(),
  identityId: yup.string(),
  displayName: yup.string(),
});

export const isCollaboratorsArray = (elem: unknown): elem is Collaborator[] => {
  const schema = yup.array().of(collaboratorSchema);

  return schema.isValidSync(elem, { stripUnknown: false });
};

export type Collaborator = {
  firstName: string;
  lastName: string;
  identityId: string;
  displayName: string;
};

export interface UserProfile {
  userProfiles: UserProfileInner[];
  totalResult: number;
}

export interface ViberConfig {
  id: number;
  displayName: string;
  viberBotId: string;
  viberBotName: string;
  uri: string;
  viberBotSenderName: string;
  iconUrl: string;
  connectedDateTime: string;
  isShowInWidget: boolean;
  viberDeeplink: string;
  channelIdentityId: string;
}

export interface TelegramConfig {
  id: number;
  displayName: string;
  telegramBotId: number;
  telegramBotDisplayName: string;
  telegramBotUserName: string;
  connectedDateTime: string;
  isShowInWidget: boolean;
  telegramDeeplink: string;
  channelIdentityId: string;
}

interface WhatsAppChatApiConfigs {
  companyId: string;
  name: string;
  whatsAppSender: string;
  wsChatAPIInstance: string;
  isConnected: boolean;
  connectedDateTime: string;
  isTrial: boolean;
  expireDate: string;
  isSubscribed: boolean;
  subscribedDate: string;
  createdAt: string;
  isShowInWidget: boolean;
  lastSyncedAt: string;
  lastRebootedAt: string;
  status: string;
  isBeta: boolean;
}

export interface SMSConfig {
  twilioAccountId: string;
  name: string;
  smsSender: string;
  connectedDateTime: string;
  isShowInWidget: boolean;
  channelIdentityId: string;
}

export interface ShoplineConfig {
  id: number;
  name: string;
  accessToken: string;
  createdAt: string;
  lastUpdatedAt: string;
  jobId: string;
  status: string;
}

export type SupportedCountry = {
  countryName: string;
  countryCode: string;
};

export interface ShopifyConfig {
  id: number;
  name: string;
  usersMyShopifyUrl: string;
  accessToken: string;
  createdAt: string;
  lastUpdatedAt: string;
  status: string;
  currency: string;
  isShopifySubscriptionPaid: boolean;
  chargeId: number;
  chargeUpdatedAt: string;
  isShowInInbox: boolean;
  supportedCountries: SupportedCountry[];
}

export interface CompanyHashtag {
  id: string;
  hashtag: string;
  hashTagColor: HashtagColorOptionsType;
  count: number;
  hashTagType: HashtagType;
}

export interface CompanyTag {
  id: number;
  companyID: string;
  importName: string;
  importedCount: number;
  updatedCount: number;
  failedCount: number;
  isImported: boolean;
  createdAt: Date;
  importedUserProfiles: unknown[];
  importedFrom: CompanyImportedFrom;
  status: string;
  totalContactCount: number;
  order: number;
  isBookmarked: boolean;
  contactListType: string;
}

export interface CompanyImportedFrom {
  userInfo: UserInfo;
  staffID: number;
  roleType: RoleType;
  name: string;
  locale: string;
  timeZoneInfoID: string;
  position: string;
  status: string;
  isAcceptedInvitation: boolean;
  isShowName: boolean;
  isNewlyRegistered: boolean;
  qrCodeIdentity: string;
}

export interface WhatsApp360DialogUsageRecord {
  id: number;
  topUpMode: number;
  partnerId: string | null;
  waba360DialogClientId: string | null;
  waba360DialogClientName: string | null;
  waba360DialogClientCreatedAt: string;
  credit: number;
  used: number;
  balance: number;
  allTimeUsage: number;
  pendingCharges: number;
  upcomingCharges: number;
  markupPrice: number;
  markupPercentage: number;
  currency: string | null;
  lastPhoneNumberBillingPeriod: string | null;
  lastConversationBillingPeriod: string | null;
  currentPhoneNumberPeriodUsage: {
    chargeablePhoneNumberQuantity: number;
    currency: string;
    unitPrice: number;
    channelIds: string[];
    billingPeriod: string;
    updatedAt: string;
  };
  currentConversationPeriodUsage: {
    totalPrice: number;
    businessInitiatedPaidQuantity: number;
    businessInitiatedPrice: number;
    businessInitiatedQuantity: number;
    freeEntryPoint: number;
    freeQuantity: number;
    freeTier: number;
    paidQuantity: number;
    quantity: number;
    userInitiatedPaidQuantity: number;
    userInitiatedPrice: number;
    userInitiatedQuantity: number;
    periodDate: string;
    billingPeriod: string;
  };
  directPaymentBalance: number;
  createdAt: string;
  updatedAt: string;
}

export interface BlastMessageConfig {
  id: string;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export type SubscriptionPlan = {
  id: string;
  subscriptionName: string;
  description: string;
  amount: number;
  maximumContact: number;
  maximumMessageSent: number;
  includedAgents: number;
  maximumCampaignSent: number;
  maximumChannel: boolean;
  extraChatAgentPlan: string;
  extraChatAgentPrice: number;
  maximumAutomation: number;
  maximumNumberOfChannel: number;
  maximumAPICall: number;
  currency: string;
  stripePlanId: string;
  subscriptionTier: number;
  version: number;
  availableFunctions: number[];
};

// eslint-disable-next-line import/export -- TODO: fix duplicate export UserInfo
export interface UserInfo {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  userName: string;
  email: string;
  userRole: string;
  phoneNumber: string;
  emailConfirmed: boolean;
  createdAt: string;
}

export interface CompanyTeamResponse {
  id: number;
  teamName: string | null;
  members: StaffWithoutCompanyResponse[];
  lastUpdatedAt: string | null;
  defaultChannels: TargetedChannelWithIds[];
  memberCount: number | null;
  teamAdmins: StaffWithoutCompanyResponse[] | null;
  qrCodeIdentity: string | null;
  qrCodeChannel: TargetedChannelWithIds;
  qrCodeAssignmentType: string | null;
  qrCodeAssignmentStaffId: string | null;
}

export interface StaffWithoutCompanyResponse {
  userInfo: UserInfo;
  staffId: number;
  role: string;
  roleType: RoleType;
  name: string;
  locale: string;
  timeZoneInfoId: string;
  timeZoneInfo: TimeZoneInfo;
  position: string;
  profilePictureURL: string;
  profilePicture: PictureFile;
  status: string;
  isAcceptedInvitation: boolean;
  notificationSetting: {
    id: number;
    emailNotificationNewMessages: boolean;
    emailNotificationConversationUpdates: boolean;
  };
  isShowName: boolean;
  message: string;
  isNewlyRegistered: boolean;
  associatedTeams: CompanyTeamResponse[];
  qrCodeIdentity: string;
  qrCodeChannel: TargetedChannelWithIds;
  defaultCurrency: string;
}

export interface BillRecord {
  id: number;
  companyId: string;
  subscriptionPlan: SubscriptionPlan;
  subscriptionPlanId: string;
  periodStart: string;
  periodEnd: string;
  status: number;
  paymentStatus: number;
  payAmount: number;
  purchaseStaff: StaffWithoutCompanyResponse;
  invoice_Id: string;
  stripe_subscriptionId: string;
  customerId: string;
  customer_email: string;
  hosted_invoice_url: string;
  invoice_pdf: string;
  chargeId: string;
  amount_due: number;
  amount_paid: number;
  amount_remaining: number;
  currency: string;
  created: string;
  shopifyChargeId: number;
  paidByReseller: boolean;
}

export interface CrmHubModelSyncConfigFilter {
  field_name: string;
  value: string;
}

export interface CrmHubModelSyncConfig {
  filters: CrmHubModelSyncConfigFilter[];
  field_filters: [
    {
      name: string;
    },
  ];
  interval: number;
  entity_type_name: string;
}

export interface CrmHubProviderConfig {
  sleekflow_company_id: string;
  key: string;
  entity_type_name_to_sync_config_dict: {
    [key: string]: CrmHubModelSyncConfig;
  };
  provider_name: string;
  is_authenticated: boolean;
  default_region_code: string;
  id: string;
  sys_type_name: string;
  ttl: number;
}

export interface PictureFile {
  id: number;
  profilePictureId: string;
  companyId: string;
  blobContainer: string;
  filename: string;
  url: string;
  mimeType: string;
}

export interface TwilioUsageRecord {
  id: number;
  start: string;
  end: string;
  description: string;
  companyId: string;
  twilioAccountId: string;
  totalCreditValue: number;
  totalPrice: number;
  currency: string;
  balance: number;
  isVerified: boolean;
}

export interface Permission {
  isShowDefaultChannelMessagesOnly: boolean;
  isShowDefaultChannelBroadcastOnly: boolean;
  receiveUnassignedNotifications: boolean;
  isMaskPhoneNumber: boolean;
  isMaskEmail: boolean;
  addAsCollaboratorWhenReply: boolean;
  addAsCollaboratorWhenAssignedToOthers: boolean;
  filterMessageWithSelectedChannel: boolean;
  isShowCampaignsPage: boolean;
  isShowAutomationPage: boolean;
  isShowAnalyticsPage: boolean;
  isShowChannelsPage: boolean;
}

interface AssociatedCompany {
  companyId: string;
  companyName: string;
  companyIconURL: string;
  companyIconFile: PictureFile;
}

export interface ResellerCompanyProfile {
  companyName?: string | null;
  companyProfileId?: string | null;
  contactEmail?: string | null;
  logoLink?: string | null;
}

export interface AddOnStatus {
  isAdditionalStaffEnabled: boolean;
  isAdditionalContactsEnabled: boolean;
  isUnlimitedContactEnabled: boolean;
  isUnlimitedChannelEnabled: boolean;
  isEnterpriseContactMaskingEnabled: boolean;
  isWhatsappQrCodeEnabled: boolean;
  isShopifyIntegrationEnabled: boolean;
  isHubspotIntegrationEnabled: boolean;
  isPaymentIntegrationEnabled: boolean;
  isSalesforceCrmEnabled: boolean;
  isSalesforceMarketingCloudEnabled: boolean;
  isSalesforceCommerceCloudEnabled: boolean;
  isOnboardingSupportActivated: boolean;
  isPiiMaskingEnabled: boolean;
  isPrioritySupportActivated: boolean;
  isChatbotSetupSupportActivated: boolean;
  isFacebookLeadAdsEnabled: boolean;
  isPlatformApiEnabled: boolean;
  isMakeIntegrationEnabled: boolean;
  isZapierIntegrationEnabled: boolean;
}

// Company
export interface Company {
  id: string;
  companyName: string;
  signalRGroupName: string;
  timeZoneInfo: TimeZoneInfo;
  facebookConfigs: FacebookConfig[];
  leadAdsFacebookConfigs: FacebookConfig[];
  emailConfig: EmailConfig;
  whatsAppConfigs: WhatsAppConfig[];
  weChatConfig: WeChatConfig;
  lineConfigs: LineConfig[];
  viberConfigs: ViberConfig[];
  telegramConfigs: TelegramConfig[];
  wsChatAPIConfigs: WhatsAppChatApiConfigs[];
  smsConfigs: SMSConfig[];
  shoplineConfigs: ShoplineConfig[];
  shopifyConfigs: ShopifyConfig[];
  instagramConfigs: InstagramConfig[];
  companyCustomFields: CompanyCustomFields[];
  customUserProfileFields: CustomUserProfileFields[];
  companyHashtags: CompanyHashtag[];
  whatsApp360DialogConfigs: WhatsApp360DialogConfigs[];
  whatsApp360DialogUsageRecords: WhatsApp360DialogUsageRecord[];
  blastMessageConfig: BlastMessageConfig;
  billRecords: BillRecord[];
  crmHubProviderConfigs: CrmHubProviderConfig[];
  createdAt: string;
  companyIconFileURL: string;
  companyIconFile: PictureFile;
  maximumAgents: number;
  maximumWhatsappInstance: number;
  maximumAutomations: number;
  maximumNumberOfChannel: number;
  currentAgents: number;
  isSubscriptionActive: boolean;
  companyCountry: string;
  isFreeTrial: boolean;
  referralCode: string;
  isRemovedChannels: boolean;
  enableSensitiveSetting: boolean;
  isShowQRCodeMapping: boolean;
  isQRCodeMappingEnabled: boolean;
  purchasedChatAPIInstance: number;
  twilioUsageRecords: TwilioUsageRecord[];
  companySetting: {
    isOptInOn: boolean;
  };
  rolePermission: {
    staffUserRole: string | null;
    permission: Permission;
  }[];
  isExceededTwilioDailyLimit: boolean;
  isPaymentFailed: boolean;
  isSandbox: boolean;
  defaultInboxOrder: string;
  isEnabledSFCC: boolean;
  isShopifyAccount: boolean;
  shopifyOrderConversion: number;
  maximumShopifyStore: number;
  associatedCompaniesList: AssociatedCompany[];
  companyType: number;
  resellerCompanyProfileId: string;
  resellerCompanyName: string;
  resellerLogoLink: string;
  resellerContactEmail: string;
  isStripePaymentEnabled: boolean;
  reseller: ResellerCompanyProfile;
  addonStatus: AddOnStatus;
  whatsappCloudApiConfigs: WhatsappCloudAPIConfig[];
  whatsappCloudApiUsageRecords: WhatsappCloudApiUsageRecord[];
  isExpressImportEnabled: boolean;
  baseSubscriptionEndDateTime?: string;
  subscriptionCountryTier?: string;
  isEntitleToFlowEnrollmentIncentive: boolean;
  v10SubscriptionMigrationStatus?: MigrationStatusType;
}

export const MigrationStatusDict = {
  SubscriptionMigrationScheduledSuccess:
    'subscription_migration_scheduled_success',
  SubscriptionMigrationScheduledFailed:
    'subscription_migration_scheduled_failed',
  SubscriptionMigrationPaymentSuccess: 'subscription_migration_payment_success',
  SubscriptionMigrationPaymentFailed: 'subscription_migration_payment_failed',
} as const;
export type MigrationStatusType =
  (typeof MigrationStatusDict)[keyof typeof MigrationStatusDict];

export interface WhatsappCloudApiUsageRecord {
  facebook_business_id: string;
  facebook_business_name: string;
  facebook_business_wabas: FacebookBusinessWaba[];
  waba_balances?: WabaBalance[];
  total_credit: Money;
  all_time_usage: Money;
  balance: Money;
  unallocated_credit: Money | undefined;
  created_at: string;
  updated_at: string;
  is_by_waba_billing_enabled?: boolean;
  _etag?: string;
  un_calculated_credit_transfer_transaction_logs: [];
}

export interface WabaBalance {
  facebook_waba_id: string;
  credit: Money;
  all_time_usage: Money;
  balance: Money;
  created_at: string;
  updated_at: string;
}

export interface Money {
  currency_iso_code: string;
  amount: number;
}

export interface FacebookBusinessWaba {
  facebook_waba_id: string;
  facebook_waba_name: string;
  facebook_phone_numbers: string[];
  channels?: ChannelConnectRowType[];
  wabaBalance?: WabaBalance;
  isConnected: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const facebookBusinessVerificationStatus = [
  'verified',
  'not_verified',
  'pending',
  'pending_need_more_info',
  'pending_submission',
  'revoked',
  'rejected',
  'disconnected',
] as const;

export type FacebookBusinessVerificationStatus =
  (typeof facebookBusinessVerificationStatus)[number];

export interface WhatsappCloudAPIConfig {
  id: number;
  companyId: string;
  channelName: string;
  channelIdentityId: string;
  messagingHubWabaPhoneNumberId: string;
  messagingHubWabaId: string;
  whatsappPhoneNumber: string;
  whatsappDisplayName: string;
  facebookWabaName: string;
  facebookWabaBusinessName: string;
  facebookWabaBusinessId: string;
  facebookWabaId: string;
  facebookPhoneNumberId: string;
  templateNamespace: string;
  facebookWabaBusinessVerificationStatus: FacebookBusinessVerificationStatus;
  facebookPhoneNumberIsPinEnabled: boolean;
  facebookPhoneNumberStatus: string;
  facebookPhoneNumberQualityRating: string;
  facebookPhoneNumberNameStatus: string;
  facebookPhoneNumberNewNameStatus: string;
  facebookPhoneNumberAccountMode: string;
  facebookPhoneNumberCodeVerificationStatus: string;
  facebookPhoneNumberIsOfficialBusinessAccount: string;
  facebookPhoneNumberMessagingLimitTier: string;
  facebookDisplayPhoneNumber: string;
  accessLevel: number;
  facebookPhoneNumberQualityScore: FacebookPhoneNumberQualityScore;
  isOptInEnable: boolean;
  createdAt: string;
  updatedAt: string;
  isShowInWidget: boolean;
}

export interface FacebookPhoneNumberQualityScore {
  score: string;
}

export interface LineConfig {
  name: string;
  basicId: string;
  channelID: string;
  numberOfMessagesSentThisMonth: number;
  numberOfTargetLimitForAdditionalMessages: number;
  connectedDateTime: string;
  isShowInWidget: boolean;
  channelIdentityId: string;
}

export interface InstagramConfig {
  instagramPageId: string;
  name: string;
  pageName: string;
  connectedDateTime: string;
  channelIdentityId: string;
  isShowInWidget: boolean;
  status: 'Authenticated' | 'Invalid' | 'Loading' | 'Syncing';
}

export interface WhatsApp360DialogConfigs {
  id: number;
  companyId: string;
  channelName: string;
  whatsAppPhoneNumber: string;
  whatsAppChannelSetupName: string;
  channelStatus: string;
  accountMode: string;
  clientId: string;
  channelId: string;
  currentQualityRating: string;
  currentLimit: string;
  wabaAccountId: string;
  wabaStatus: string;
  wabaBusinessId: string;
  wabaAccountName: string;
  wabaBusinessStatus: string;
  wabaAccountType: string;
  templateNamespace: string;
  isClient: boolean;
  accessLevel: number;
  isOptInEnable: boolean;
  optInConfig: WhatsApp360DialogConfigsOptIn;
  isSuspended: boolean;
  channelErrorStatus: number;
  channelErrorStatusStartAt: string;
  createdAt: string;
  updatedAt: string;
  channelIdentityId: string;
  isShowInWidget: boolean;
}

export interface WhatsApp360DialogConfigsOptIn {
  templateName: string;
  templateNamespace: string;
  language: WABA360DialogCommonEnumsWhatsAppLanguage;
  templateMessageContent: string;
  readMoreTemplateButtonMessage: string;
}

export type WABA360DialogCommonEnumsWhatsAppLanguage =
  | 'af'
  | 'sq'
  | 'ar'
  | 'az'
  | 'bn'
  | 'bg'
  | 'ca'
  | 'zh_CN'
  | 'zh_HK'
  | 'zh_TW'
  | 'hr'
  | 'cs'
  | 'da'
  | 'nl'
  | 'en'
  | 'en_GB'
  | 'en_US'
  | 'et'
  | 'fil'
  | 'fi'
  | 'fr'
  | 'ka'
  | 'de'
  | 'el'
  | 'gu'
  | 'ha'
  | 'he'
  | 'hi'
  | 'hu'
  | 'id'
  | 'ga'
  | 'it'
  | 'ja'
  | 'kn'
  | 'kk'
  | 'rw_RW'
  | 'ko'
  | 'ky_KG'
  | 'lo'
  | 'lv'
  | 'lt'
  | 'mk'
  | 'ms'
  | 'ml'
  | 'mr'
  | 'nb'
  | 'fa'
  | 'pl'
  | 'pt_BR'
  | 'pt_PT'
  | 'pa'
  | 'ro'
  | 'ru'
  | 'sr'
  | 'sk'
  | 'sl'
  | 'es'
  | 'es_AR'
  | 'es_ES'
  | 'es_MX'
  | 'sw'
  | 'sv'
  | 'ta'
  | 'te'
  | 'th'
  | 'tr'
  | 'uk'
  | 'ur'
  | 'uz'
  | 'vi'
  | 'zu';

export interface WhatsAppConfig {
  twilioAccountId: string;
  whatsAppSender: string;
  name: string;
  connectedDateTime: string;
  isShowInWidget: boolean;
  readMoreTemplateId: string;
  readMoreTemplateMessage: string;
  totalCreditValue: number;
  isSubaccount: boolean;
  channelIdentityId: string;
  messagingServiceSid: string;
}

export interface TimeZoneInfo {
  id: string;
  displayName: string;
  standardName: string;
  baseUtcOffset: string;
  baseUtcOffsetInHour: number;
}

export interface FacebookConfig {
  id: number;
  pageId: string;
  name: string;
  pageName: string;
  connectedDateTime: string;
  channelIdentityId: string;
  isShowInWidget: boolean;
  status: 'Authenticated' | 'Invalid' | 'Loading';
}

export interface FacebookConfigWithLeadAdForms {
  id: number;
  name: string;
  pageId: string;
  connectedDate: string;
  configurationStatus: FacebookLeadAdPageConfigStatusEnum;
  forms: Array<FacebookFormLeadAdConnection>;
  status: 'Authenticated' | 'Invalid' | 'Loading';
}

export type FacebookFormLeadAdConnection = {
  id: number;
  facebookFormName: string;
  displaySetting: FacebookFormDisplayEnum | undefined;
  setupStatus: FacebookFormSetupEnum;
  crmHubSchema?: {
    id: string;
    displayName: string;
  };
};

export enum FacebookFormSetupEnum {
  Pending = 0,
  Configured = 1,
}

export enum FacebookLeadAdPageConfigStatusEnum {
  InProgress = 0,
  Completed = 1,
}

export enum FacebookFormDisplayEnum {
  Hide = 1,
  Show = 0,
}

export type FacebookLeadAdFormField = {
  id: string;
  key: string;
  label: string;
  type: string;
  options?: never[];
};

export type FacebookLeadAdFieldMapping =
  | {
      sleekflowFieldType:
        | FacebookLeadAdFieldTypeEnum.CompanyField
        | FacebookLeadAdFieldTypeEnum.CompanyFirstName
        | FacebookLeadAdFieldTypeEnum.CompanyLastName;
      facebookLeadAdsFormFieldId: string;
      sleekflowFieldId: string;
    }
  | {
      sleekflowFieldType: FacebookLeadAdFieldTypeEnum.CustomField;
      facebookLeadAdsFormFieldId: string;
      schemaProperty: {
        id?: string;
        displayName: string;
        uniqueName: string;
        displayOrder: number;
      };
    };

export enum FacebookLeadAdFieldTypeEnum {
  CompanyField = 0,
  CustomField = 1,
  CompanyFirstName = 2,
  CompanyLastName = 3,
}

export type FacebookLeadAdFieldMappingResponse = {
  crmHubSchema: {
    displayName: string;
    id: string;
  };
  fieldMappings: Array<{
    id: number;
    facebookLeadAdsFormField: {
      id: string;
      key: string;
      label: string;
      type: string;
      options: [];
    };
    sleekflowField:
      | MappingContactPropertyResponse
      | MappingContactNamePropertyResponse
      | MappingCustomObjectFieldResponse;
  }>;
};

type MappingContactPropertyResponse = {
  sleekflowFieldType: FacebookLeadAdFieldTypeEnum.CompanyField;
  companyCustomUserProfileField: {
    id: string;
    customUserProfileFieldLinguals: Array<{
      language: string;
      displayName: string;
    }>;
    customUserProfileFieldOptions: [];
    fieldName: string;
    type: string;
  };
};

type MappingContactNamePropertyResponse = {
  sleekflowFieldType:
    | FacebookLeadAdFieldTypeEnum.CompanyFirstName
    | FacebookLeadAdFieldTypeEnum.CompanyLastName;
};

type MappingCustomObjectFieldResponse = {
  sleekflowFieldType: FacebookLeadAdFieldTypeEnum.CustomField;
  crmHubSchemaProperty: {
    id: string;
    displayName: string;
    uniqueName: string;
    dataType: {
      name: string;
    };
    displayOrder: 1;
  };
};

export interface EmailConfig {
  name: string;
  domain: string;
  email: string;
  connectedDateTime: string;
  isShowInWidget: boolean;
  channelIdentityId: string;
}

export interface WeChatConfig {
  name: string;
  webChatId: string;
  appId: string;
  qrCodeURL: string;
  connectedDateTime: string;
  isShowInWidget: boolean;
  channelIdentityId: string;
}

export const CUSTOM_USER_PROFILE_FIELDS_TYPE = [
  'Lists',
  'Labels',
  'TravisUser',
  'Date',
  'DateTime',
  'Options',
  'PhoneNumber',
  'Channel',
  'SingleLineText',
  'MultiLineText',
  'Number',
  'Email',
  'Boolean',
  'BlogURLs',
  'Json',
  'URL',
  'Team',
  'ContactOwnerField',
  'UserLanguage',
  'Collaborators',
  'CrmSourceObjectId',
  'CrmSourceProviderName',
] as const;

export const CUSTOM_USER_PROFILE_FIELDS_CATEGORY = [
  'Segmentation',
  'Custom',
  'Default',
  'Message',
  'SleekFlowUser',
  'Shopify',
] as const;

export type CustomUserProfileFieldsCategory =
  (typeof CUSTOM_USER_PROFILE_FIELDS_CATEGORY)[number];

export type CustomUserProfileFieldsType =
  (typeof CUSTOM_USER_PROFILE_FIELDS_TYPE)[number];

export type TransformedCustomUserProfileOptions = Record<
  string,
  TransformedLinguals
>;

export interface CustomUserProfileFieldsForEditColumns {
  id: string;
  customUserProfileFieldLinguals: TransformedLinguals;
  customUserProfileFieldOptions: TransformedUserProfileOptions;
  fieldName: string;
  type: CustomUserProfileFieldsType;
  order: number;
  isVisible: boolean;
  isEditable: boolean;
  isDefault: boolean;
  isDeletable: boolean;
  fieldsCategory: CustomUserProfileFieldsCategory;
}

export interface CustomUserProfileFields {
  id: string;
  customUserProfileFieldLinguals: Linguals[];
  customUserProfileFieldOptions: CustomUserProfileFieldOptions[];
  fieldName: string | 'Labels' | 'Collaborators' | 'ContactOwner';
  type: CustomUserProfileFieldsType;
  order: number;
  isVisible: boolean;
  isEditable: boolean;
  isDefault: boolean;
  isDeletable: boolean;
  fieldsCategory: CustomUserProfileFieldsCategory;
}

export interface CustomUserProfileFieldOptions {
  id: number;
  customUserProfileFieldOptionLinguals: Linguals[];
  value: string;
  order: number;
}

export interface Linguals {
  language: 'en' | 'zh-hk' | 'zh-cn';
  displayName: string;
}

export interface CompanyCustomFields {
  id?: string;
  category: string;
  companyCustomFieldFieldLinguals: Linguals[];
  fieldName: string;
  value: string;
  type: string;
  order: number;
  isVisible: boolean;
  isEditable: boolean;
  isDefault: boolean;
}
export type AssociatedTeam = {
  id: string;
  teamName: string;
  members: unknown[]; // find type?
  lastUpdatedAt: string; // stringified date
  defaultChannels: unknown[]; // find type
  qrCodeChannel: {
    channel: string;
    ids: string[];
  };
  qrCodeAssignmentType: string; // enum?
};
export interface Staff {
  userInfo: UserInfo;
  staffId: number;
  roleType: RoleType;
  rbacRoles?: RbacRole[];
  name: string;
  locale: 'en' | 'zh-hk' | 'zh-cn';
  timeZoneInfoId: string;
  timeZoneInfo: TimeZoneInfo;
  position: string;
  status: UserStatusType;
  isAcceptedInvitation: boolean;
  isShowName: boolean;
  message: string;
  isNewlyRegistered: boolean;
  profilePicture: {
    id: number;
    profilePictureId: string;
    url: string;
    companyId: string;
    filename: string;
    blobContainer: string;
  };
  profilePictureURL: string;
  associatedTeams?: AssociatedTeam[];
  qrCodeIdentity: string;
  qrCodeChannel: {
    channel: string;
    ids: string[];
  };
  isCompanyOwner: boolean;
}

export interface UserProfileListDetail {
  id: number;
  companyId: string;
  importName: string;
  importedCount: number;
  updatedCount: number;
  failedCount: number;
  isImported: boolean;
  createdAt: Date;
  importedUserProfiles: any[]; // check type
  importedFrom: Staff;
  status: string;
  /**
   * @deprecated Don't trust this total contacts number field, returns outdated value
   * most of the time (maybe cache) If you need total number use the contacts search API
   */
  totalContactCount: number;
  order: number;
  isBookmarked: boolean;
  contactListType: string;
}

interface TargetedChannelWithIds {
  channel: ChannelType;
  ids: string[];
}

interface StatisticsData {
  sent: number;
  delivered: number;
  read: number;
  replied: number;
  failed: number;
}

export interface FormattedBroadcastStatistic {
  delivered: string;
  failed: string;
  read: string;
  replied: string;
  sent: string;
  updatedAt: string;
}

export interface Broadcast {
  id: string;
  targetedChannel: {
    channelType: string;
    channelIdentityId: string;
  };
  savedByDisplayName: string;
  targetedChannelWithIds: TargetedChannelWithIds[];
  status: BroadcastStatus;
  updatedAt: string;
  createdAt: string;
  templateName: string;
  sentAt: string;
  savedBy: { name: string; userInfo: UserInfo };
  statisticsData: FormattedBroadcastStatistic;
}

interface ImportedFrom {
  name: string;
}

export interface UserProfileList {
  isBookmarked: boolean;
  createdAt: string;
  importName: string;
  status: string;
  totalContactCount: number;
  importedFrom: ImportedFrom;
  isImported: boolean;
  id: number;
}

export interface Sender {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  userName: string;
  email: string;
  phoneNumber: string;
  emailConfirmed: boolean;
  createdAt: Date;
}

export const MIME_TYPE = {
  audioMPEG: 'audio/mpeg',
  audioMp3: 'audio/mp3',
  imageJPEG: 'image/jpeg',
  imagePng: 'image/png',
  imageGif: 'image/gif',
  imageWebp: 'image/webp',
  videoMp4: 'video/mp4',
  applicationPdf: 'application/pdf',
  applicationDocument:
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  applicationGoogleSheet:
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
} as const;

// loosely typed because MimeType has too many possibilities
export type MimeType =
  | Omit<string, (typeof MIME_TYPE)[keyof typeof MIME_TYPE]>
  | (typeof MIME_TYPE)[keyof typeof MIME_TYPE];

export type AttachmentUrlResponse = {
  url: string;
  MIMEType: MimeType;
};

export interface UploadedFile {
  fileId: string;
  channel: MimeType;
  senderId?: string;
  sender?: Sender;
  blobContainer: string;
  filename: string;
  url: string;
  mimeType: MimeType;
  fileSize: number;
}

export interface ConversationMessage {
  id: number;
  companyId: string;
  messageGroupName: string;
  conversationId: string;
  messageChecksum: string;
  channel: ChannelType;
  channelIdentityId: string;
  webClientSender?: WebClient;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    displayName?: string;
    email?: string;
  };
  messageType: MessageType;
  deliveryType: string;
  messageContent: string;
  uploadedFiles: UploadedFile[];
  createdAt: string;
  updatedAt: string; // Date?
  scheduleSentAt: string;
  timestamp: number;
  status:
    | 'Sent'
    | 'Send'
    | 'Received'
    | 'Read'
    | 'Failed'
    | 'Deleted'
    | 'Scheduled'
    | 'OutOfCredit';
  channelName: string;
  isSentFromSleekflow: boolean;
  isSandbox: boolean;
  isFromImport: boolean;
  sleekPayRecord?: {
    userProfileId: string;
    staffId: number;
    teamId: number;
    shopifyId: number;
    shopifyDraftOrderId: number;
    shopifyOrderId: number;
    shopifyInvoiceUrl: string;
    shopifyOrderStatusUrl: string;
    paymentUrl: string;
    paymentTrackingUrl: string;
    stripePaymentIntentId: string;
    status:
      | 'Canceled'
      | 'Paid'
      | 'Pending'
      | 'Failed'
      | 'RefundPending'
      | 'Refunded'
      | 'PartialRefund'
      | 'RefundFailed'
      | 'RefundCanceled';
    payAmount: number;
    customerId: string;
    customerEmail: string;
    amountDue: number;
    amountReceived: number;
    requestedApplicationFeeAmount: number;
    receivedApplicationFeeAmount: number;
    currency: string;
    receiptUrl: string;
    lineItems: [
      {
        name: string;
        description: string;
        amount: number;
        quantity: number;
        currency: string;
        images: [string];
        totalDiscount: number;
        metadata: {
          variantId: string;
        };
      },
    ];
    paidAt: string;
    canceledAt: string;
    cancellationReason: string;
    createdAt: string;
    updatedAt: string;
    id: number;
  };
  instagramSender?: InstagramUser;
  instagramReceiver?: InstagramUser;
  whatsappSender?: WhatsappUser;
  whatsappReceiver?: WhatsappUser;
  facebookSender?: FacebookUser;
  facebookReceiver?: FacebookUser;
  whatsapp360DialogSender?: WhatsApp360DialogUser;
  whatsapp360DialogReceiver?: WhatsApp360DialogUser;
  whatsappCloudApiSender?: WhatsappCloudApiUser;
  whatsappCloudApiReceiver?: WhatsappCloudApiUser;
  whatsapp360DialogExtendedMessagePayload?: Whatsapp360DialogExtendedMessagePayloadType;
  messageAssignee?: Assignee;
  extendedMessagePayload?:
    | WhatsappCloudExtendedMessagePayloadType
    | WhatsappTwilioContentExtendedMessagePayloadType
    | AdExtendedMessagePayloadType;
  metadata?: WhatsappCloudAPIMetadata;
  channelStatusMessage?: string;
  messageUniqueID?: string;
  quotedMsgId?: string;
  quotedMsgBody?: string;
  storyURL?: string;
  openGraphData?: OpenGraphData;
  smsSender?: SmsUser;
  smsReceiver?: SmsUser;
  messageChannel: string;
  senderDevice: {
    userId: string;
    deviceName: string;
    deviceUUID: string;
    platform: 0 | 1;
    osVersion: string;
    appVersion: string;
    notificationToken: string;
    status: number;
    last_login: string;
    created_at: string;
    updated_at: string;
    iP_Address: string;
    signalRConnectionId: string;
    deviceModel: string;
    buildVersion: string;
    appID: string;
    unreadBadgeNumber: number;
  };
  whatsappCloudApiReceiverId?: string;
  dynamicChannelSender: {
    channelIdentityId: string;
    channelType: ChannelType;
    companyId: string;
    senderEntityId: number;
    userDisplayName: string;
    userIdentityId: string;
  };
  viberSender?: ViberUser;
  viberReceiver?: ViberUser;
  lineSender?: LineUser;
  lineReceiver?: LineUser;
  telegramSender?: TelegramUser;
  telegramReceiver?: TelegramUser;
  weChatSender?: WeChatUser;
  weChatReceiver?: WeChatUser;
}

// TODO: define details later
export interface Team {
  id: number;
  teamName: string;
  members: Staff[];
  lastUpdatedAt: string;
  defaultChannels: { channels: string }[];
  memberCount: number;
  teamAdmins: Staff[];
  qrCodeIdentity: string;
  qrCodeChannel: {
    channel: string;
    ids: Array<string>;
  };
  qrCodeAssignmentType: string;
}

export const BackgroundTaskType = {
  ImportContacts: 10,
  AddContactsToList: 11,
  BulkUpdateContactsCustomFields: 12,
  BulkImportContacts: 13,
  ExportContactsListToCsv: 21,
  ExportBroadcastStatusListToCsv: 22,
  ExportAnalyticToCsv: 23,
  ExportAnalyticRevampToCsv: 24,
  ImportWhatsAppHistory: 31,
  LoopThroughSleekflowContact: 50,
  ExportFlowUsageCsv: 60,
  ExportTicketCsv: 70,
} as const;

export type BackgroundTaskType =
  (typeof BackgroundTaskType)[keyof typeof BackgroundTaskType];

export interface BackgroundTaskResultType {
  fileName: string;
  filePath: string;
  mimeType: string;
  url: string;
  fileSize: 0;
  resultPayloadType: string;
}

export const BackgroundTaskStatus = {
  Queued: 0,
  Started: 1,
  Processing: 2,
  Completed: 3,
  Error: 500,
} as const;

export type BackgroundTaskStatus =
  (typeof BackgroundTaskStatus)[keyof typeof BackgroundTaskStatus];

export const TargetType = {
  None: 0,
  Contact: 1,
  List: 2,
  Campaign: 3,
  Analytic: 4,
  IndividualContacts: 6,
} as const;

export type TargetType = (typeof TargetType)[keyof typeof TargetType];

interface CommonTargetFieldType {
  targetType: Exclude<
    TargetType,
    typeof TargetType.List | typeof TargetType.Campaign
  >;
}

interface BroadcastTargetFieldType {
  broadcastTemplateId: string;
  templateName: string;
  targetType: typeof TargetType.Campaign;
}

type ListImportTargetFieldType = {
  listId: number;
  importName?: string;
  targetType: typeof TargetType.List;
};

export interface BackgroundTaskResponseTypeFromApi {
  id: number;
  companyId: string;
  staffId: number;
  userId: string;
  total: number;
  progress: number;
  isCompleted: boolean;
  isDismissed: boolean;
  startedAt: string | null;
  completedAt: string | null;
  taskType: BackgroundTaskType;
  updatedAt: string | null;
  createdAt: string | null;
  errorMessage: string | null;
  taskStatus: BackgroundTaskStatus;
  target:
    | BroadcastTargetFieldType
    | CommonTargetFieldType
    | ListImportTargetFieldType;
  result?: BackgroundTaskResultType;
}

export interface Whatsapp360DialogTemplateMessageComponentGeneralType {
  type: 'header' | 'body' | 'footer' | 'button';
}

export interface Whatsapp360DialogTemplateMessageComponentTextParameterType {
  type: 'text';
  text: string;
}

export interface Whatsapp360DialogTemplateMessageComponentDocumentParameterType {
  type: 'document';
  document: {
    id?: string;
    link: string;
    filename: string;
  };
}

export interface Whatsapp360DialogTemplateMessageComponentImageParameterType {
  type: 'image';
  image: {
    id?: string;
    link: string;
    filename: string;
  };
}

export interface WhatsappCloudApiTemplateMessageComponentImageParameterType {
  type: 'image';
  image: {
    id?: string;
    link: string;
  };
}

export interface Whatsapp360DialogTemplateMessageComponentVideoParameterType {
  type: 'video';
  video: {
    id?: string;
    link: string;
  };
}

export type WhatsappTemplateMessageComponentHeaderParameterType =
  | Whatsapp360DialogTemplateMessageComponentTextParameterType
  | Whatsapp360DialogTemplateMessageComponentDocumentParameterType
  | Whatsapp360DialogTemplateMessageComponentVideoParameterType
  | Whatsapp360DialogTemplateMessageComponentImageParameterType
  | WhatsappCloudApiTemplateMessageComponentImageParameterType;

export interface WhatsappTemplateMessageComponentHeaderType
  extends Whatsapp360DialogTemplateMessageComponentGeneralType {
  type: 'header';
  parameters: Array<WhatsappTemplateMessageComponentHeaderParameterType>;
}

export interface WhatsappTemplateMessageComponentBodyType
  extends Whatsapp360DialogTemplateMessageComponentGeneralType {
  type: 'body';
  parameters: Array<Whatsapp360DialogTemplateMessageComponentTextParameterType>;
}

export type TemplateMessageComponentType =
  | WhatsappTemplateMessageComponentHeaderType
  | WhatsappTemplateMessageComponentBodyType
  | WhatsappTemplateMessageComponentButtonType;

export interface WhatsappTemplateMessageComponentButtonType
  extends Whatsapp360DialogTemplateMessageComponentGeneralType {
  type: 'button';
  sub_type: 'quick_reply' | 'url' | 'reply' | 'phone';
  index: number;
  parameters: Array<
    | {
        type: 'payload';
        payload: string;
      }
    | {
        type: 'text';
        text: string;
      }
  >;
}

export interface Whatsapp360DialogTemplateMessageType {
  templateNamespace: string;
  templateName: string;
  language: string;
  components?: Array<TemplateMessageComponentType>;
}

export type QuickReplyAction = {
  buttons: {
    type: string;
    reply: {
      id: string;
      title: string;
    };
  }[];
};

export type ListMessageAction = {
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
  type: 'list';
  body: {
    text: string;
    type: string;
  };
  action: ListMessageAction;
};

export type QuickReplyObjectType = {
  type: 'button';
  body: {
    text: string;
    type: string;
  };
  action: QuickReplyAction;
};

export type Whatsapp360DialogInteractiveObjectType =
  | ListMessageObjectType
  | QuickReplyObjectType;

export interface Whatsapp360DialogTemplatePayload {
  messageType: 'template';
  messageContent: string;
  whatsapp360DialogExtendedMessagePayload: Whatsapp360DialogExtendedMessagePayloadType;
}

export interface WhatsappCloudTemplatePayload {
  messageType: 'template';
  messageContent: string;
  extendedMessagePayload: WhatsappCloudExtendedMessagePayloadType;
}

export interface WhatsappTwilioTemplatePayload {
  messageType: 'text';
  messageContent: string;
}

export interface WhatsappTwilioContentTemplatePayload {
  messageContent: string;
  messageType: 'text';
  extendedMessagePayload: WhatsappTwilioContentExtendedMessagePayloadType;
}

export interface WhatsappTwilioContentExtendedMessagePayloadType {
  extendedMessageType: typeof ExtendedMessageType.WhatsappTwilioContentTemplateMessage;
  extendedMessagePayloadDetail: WhatsappTwilioContentExtendedMessagePayloadDetailType;
}

export interface WhatsappTwilioContentExtendedMessagePayloadDetailType {
  whatsappTwilioContentApiObject: WhatsappTwilioContentApiObjectType;
}

export interface WhatsappTwilioContentApiObjectType {
  contentSid: string;
  contentVariables: ContentVariables;
}

export interface ContentVariables {
  [key: string]: string;
}

export interface Whatsapp360DialogExtendedMessagePayloadType {
  id?: number;
  whatsapp360DialogTemplateMessage?: Whatsapp360DialogTemplateMessageType;
  whatsapp360DialogInteractiveObject?: Whatsapp360DialogInteractiveObjectType;
}

export interface WhatsappCloudExtendedMessagePayloadType {
  id?: string;
  channel: 'whatsappcloudapi';
  extendedMessageType?:
    | typeof ExtendedMessageType.WhatsappCloudApiTemplateMessage
    | typeof ExtendedMessageType.WhatsappCloudApiInteractiveMessage;
  extendedMessagePayloadDetail?: WhatsappCloudExtendedMessagePayloadDetail;
}

export interface WhatsappCloudExtendedMessagePayloadDetail {
  whatsappCloudApiTemplateMessageObject?: WhatsappCloudAPITemplateMessageObjectType;
  whatsappCloudApiInteractiveObject?: WhatsappCloudInteractiveObjectType;
}

export interface WhatsappCloudAPITemplateMessageObjectType {
  templateId?: string;
  templateName: string;
  language: string;
  components: Array<TemplateMessageComponentType>;
}

export interface WhatsappCloudAPIMetadata {
  'whatsappcloudapi:template:components': WhatsappCloudAPITemplateComponent[];
  'whatsappcloudapi:conversation': WhatsappCloudapiConversation;
  'whatsappcloudapi:pricing': WhatsappCloudapiPricing;
}

export interface WhatsappCloudapiConversation {
  id: string;
  origin: {
    type: string;
  };
}

export interface WhatsappCloudapiPricing {
  pricing_model: string;
  billable: boolean;
  category: string;
}

export type WhatsappCloudInteractiveObjectType =
  | ListMessageObjectType
  | QuickReplyObjectType;

export const ChannelTypeList = [
  'email',
  'note',
  'whatsapp',
  'facebook',
  'instagram',
  'sms',
  'web',
  'wechat',
  'line',
  'twilio_whatsapp',
  'facebookLeadAds',
  'zapier',
  'sleekflowApi',
  'googleSheet',
  'shopify',
  'woocommerce',
  'shopline',
  'calendly',
  'whatsapp360dialog',
  'viber',
  'telegram',
  'stripe',
  'salesforce',
  'make',
  'hubspot',
  'whatsappcloudapi',
] as const;

export type ChannelType = (typeof ChannelTypeList)[number];

export const CONVERSATION_STATUS = {
  open: 'open',
  closed: 'closed',
  pending: 'pending',
  // TODO: Pending for clarification
  // SCHEDULED: 'scheduled',
  // UNREAD: 'unread',
} as const;

export type ConversationStatus =
  (typeof CONVERSATION_STATUS)[keyof typeof CONVERSATION_STATUS];

export interface Assignee {
  userInfo: UserInfo;
  staffID: number;
  roleType?: RoleType;
  name: string;
  locale: string;
  timeZoneInfoID: string;
  position: string;
  status: string;
  isAcceptedInvitation: boolean;
  isShowName: boolean;
  isNewlyRegistered: boolean;
  qrCodeChannel: {
    channel: string;
    ids: string[];
  };
}

interface WebClient {
  webClientUUID: string;
  ipAddress: string;
  name: string;
  locale: string;
  createdAt: Date;
  updatedAt: Date;
  onlineStatus: string;
}

// @deprecated use in favour of ConversationMessage type instead
export interface Message {
  id: string;
  companyID: string;
  messageGroupName: string;
  conversationId: string;
  messageChecksum: string;
  channel: string;
  webClientSender?: WebClient;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    displayName: string;
  };
  messageType:
    | 'text'
    | 'file'
    | 'interactive'
    | 'activity'
    | 'template'
    | 'reaction'
    | 'FacebookAdClickToMessenger';
  deliveryType: string;
  messageContent: string;
  //TODO: define type
  uploadedFiles: any[];
  createdAt: string;
  updatedAt: string;
  timestamp: number;
  status:
    | 'Sent'
    | 'Send'
    | 'Received'
    | 'Read'
    | 'Failed'
    | 'Deleted'
    | 'Scheduled';
  channelName: string;
  isSentFromSleekflow: boolean;
  isSandbox: boolean;
  isFromImport: boolean;
  sleekPayRecord?: {
    userProfileId: string;
    staffId: number;
    teamId: number;
    shopifyId: number;
    shopifyDraftOrderId: number;
    shopifyOrderId: number;
    shopifyInvoiceUrl: string;
    shopifyOrderStatusUrl: string;
    paymentUrl: string;
    paymentTrackingUrl: string;
    stripePaymentIntentId: string;
    status:
      | 'Canceled'
      | 'Paid'
      | 'Pending'
      | 'Failed'
      | 'RefundPending'
      | 'Refunded'
      | 'PartialRefund'
      | 'RefundFailed'
      | 'RefundCanceled';
    payAmount: number;
    customerId: string;
    customerEmail: string;
    amountDue: number;
    amountReceived: number;
    requestedApplicationFeeAmount: number;
    receivedApplicationFeeAmount: number;
    currency: string;
    receiptUrl: string;
    lineItems: [
      {
        name: string;
        description: string;
        amount: number;
        quantity: number;
        currency: string;
        images: [string];
        totalDiscount: number;
        metadata: {
          variantId: string;
        };
      },
    ];
    paidAt: string;
    canceledAt: string;
    cancellationReason: string;
    createdAt: string;
    updatedAt: string;
    id: number;
  };
  instagramSender?: InstagramUser;
  instagramReceiver?: InstagramUser;
  whatsappSender?: WhatsappUser;
  whatsappReceiver?: WhatsappUser;
  facebookSender?: FacebookUser;
  facebookReceiver?: FacebookUser;
  whatsapp360DialogSender?: WhatsApp360DialogUser;
  whatsapp360DialogReceiver?: WhatsApp360DialogUser;
  whatsappCloudApiSender?: WhatsappCloudApiUser;
  whatsappCloudApiReceiver?: WhatsappCloudApiUser;
  smsSender?: SmsUser;
  smsReceiver?: SmsUser;
  whatsapp360DialogExtendedMessagePayload?: Whatsapp360DialogExtendedMessagePayloadType;
  messageAssignee?: Assignee;
  extendedMessagePayload?:
    | WhatsappCloudExtendedMessagePayloadType
    | WhatsappTwilioContentExtendedMessagePayloadType
    | AdExtendedMessagePayloadType;
  channelStatusMessage?: string;
  messageUniqueID?: string;
  quotedMsgId?: string;
  quotedMsgBody?: string;
  quotedMessage?: Message;
  storyURL?: string;
  openGraphData?: OpenGraphData;
}

export type AdExtendedMessagePayloadType =
  | FacebookAdExtendedMessagePayloadType
  | WhatsappAdExtendedMessagePayloadType;

export interface FacebookAdExtendedMessagePayloadType {
  id: string;
  channel: 'facebook';
  extendedMessageType: typeof ExtendedMessageType.adClickToMessengerMessage;
  extendedMessagePayloadDetail: FacebookAdExtendedMessagePayloadDetail;
}

export interface WhatsappAdExtendedMessagePayloadType {
  id: string;
  extendedMessageType: typeof ExtendedMessageType.adClickToWhatsappMessage;
  extendedMessagePayloadDetail: WhatsappAdExtendedMessagePayloadDetail;
}

export interface WhatsappAdExtendedMessagePayloadDetail {
  whatsappCloudApiReferral: {
    headline: string;
    source_type: string;
    source_id: string;
    source_url: string;
  };
}

export interface FacebookAdExtendedMessagePayloadDetail {
  facebookAdClickToMessengerObject: {
    ad_id: string;
    ad_title: string;
    ad_text: string;
    ad_permalink_url: string;
    message: string;
  };
}

export interface EmailAddressType {
  email: string;
  name: string;
  locale: string;
}

// eslint-disable-next-line import/export -- TODO: fix duplicate export InstagramUserType
export interface InstagramUserType {
  companyId: string;
  instagramId: string;
  instagramPageId: string;
  username: string;
}

// eslint-disable-next-line import/export -- TODO: fix duplicate export WhatsappCloudApiUser
export interface WhatsappCloudApiUser {
  whatsappChannelPhoneNumber: string;
  whatsappId: string;
}

export interface FacebookAccountType {
  id: string;
  pageId: string;
  facebookId: string;
  name: string;
  email: string;
  locale: string;
  profile_pic: string;
}

export interface ViberUserType {
  id: number;
  companyId: string;
  viberUserId: string;
  displayName: string;
  viberBotId: string;
  isSubscribed: boolean;
  channelIdentityId: string;
}

export interface TelegramUserType {
  id: number;
  companyId: string;
  firstName: string;
  lastName: string;
  type: string;
  telegramChatId: number;
  telegramBotId: number;
}

export interface WeChatUserType {
  openid: string;
  nickname: string;
  language: string;
  headimgurl: string;
}

export type ContactStatusEnum = 'valid' | 'invalid' | 'failed';

export interface WhatsApp360DialogUserType {
  channelId: number;
  companyId: string;
  contactStatus: ContactStatusEnum;
  createdAt: string;
  id: number;
  name: string;
  phoneNumber: string;
  updatedAt: string;
  whatsAppId: string;
}

export interface WhatsAppAccountType {
  id: string;
  locale: string;
  phone_number: string;
  name: string;
  instanceId: string;
  is_group: boolean;
  is_twilio: boolean;
}

export interface SmsUserType {
  id: string;
  locale: string;
  phone_number: string;
  name: string;
}

export interface LineUserType {
  userId: string;
  displayName: string;
  pictureUrl: string;
  channelIdentityId: string;
}

// eslint-disable-next-line import/export -- TODO: fix duplicate export InstagramUserType
export interface InstagramUserType {
  companyId: string;
  instagramId: string;
  instagramPageId: string;
  username: string;
}

export interface UserprofileChannels {
  webClient?: WebClient;
  emailAddress?: EmailAddressType;
  weChatUser?: WeChatUserType;
  whatsAppAccount?: WhatsAppAccountType;
  smsUser?: SmsUserType;
  telegramUser?: TelegramUserType;
  viberUser?: ViberUserType;
  whatsApp360DialogUser?: WhatsApp360DialogUserType;
  facebookAccount?: FacebookAccountType;
  lineUser?: LineUserType;
  instagramUser?: InstagramUserType;
  whatsappCloudApiUser?: WhatsappCloudApiUser;
}

export interface Conversation {
  messages: ConversationMessage[];
  conversationId: string;
  companyID: string;
  conversationChannels: string[];
  displayProfilePicture?: string;
  messageGroupName: string;
  userProfile: UserProfileInner;
  status: ConversationStatus;
  assignee: Assignee;
  additionalAssignees: { assignee: Assignee }[];
  assignedTeam: Team;
  conversationHashtags: Hashtag[];
  lastMessage: ConversationMessage[];
  updatedTime: Date;
  modifiedAt: string;
  unreadMessageCount: number;
  firstMessageID: number;
  lastMessageID: number;
  lastMessageChannel: ChannelType;
  isSandbox: boolean;
  isBookmarked: boolean;
  isStarred: boolean;
  metadata?: {
    whatsappcloudapi: WhatsappCloudApiMetadata[];
  };
}

export type WhatsappCloudApiMetadata = {
  channel_identity_id: string;
  channel_metadata: {
    conversation: {
      id: string;
      expiration_timestamp: number;
      origin: {
        type: string;
      };
    };
  };
};

export interface HashTagCondition {
  containHashTag: string;
  values: string[];
  timeValueType?: number;
  conditionOperator: RuleOptionsValues | '';
  nextOperator: 'And' | 'Or';
}

export interface FieldCondition {
  values: string[];
  timeValueType?: number;
  fieldName: keyof FilterRulesConfig | '' | 'ImportFrom' | 'Country';
  conditionOperator: RuleOptionsValues | '';
  nextOperator: 'And' | 'Or';
}

export interface MessageTemplateCondition {
  companyMessageTemplateId: string;
  broadcastMessageStatus: number | string;
}

export type Condition =
  | HashTagCondition
  | FieldCondition
  | MessageTemplateCondition;

export interface TwilioWhatsappTemplateResponse {
  whatsapp_templates: TwilioWhatsappTemplate[];
  meta: Meta;
}

export interface TwilioContentWhatsappTemplateResponse {
  meta: Meta;
  contents: TwilioContentTemplateFromApi[];
}

export interface TwilioContentTemplateFromApi {
  language: string;
  date_updated: string;
  variables: TwilioContentWhatsappTemplateVariables;
  friendly_name: string;
  account_sid: string;
  url: string;
  sid: string;
  date_created: string;
  types: TwilioContentWhatsappTemplateTypes;
  links: TwilioContentWhatsappTemplateLinks;
  approval_requests: TwilioContentWhatsappTemplateApprovalRequests;
  isBookmarked: boolean;
}

export interface TwilioContentWhatsappTemplateApprovalRequests {
  category: string;
  status: 'approved' | 'unsubmitted' | 'rejected';
  name: string;
  allow_category_change: boolean;
  content_type: string;
  rejection_reason: string;
}

export interface TwilioContentWhatsappTemplateLinks {
  approval_fetch: string;
  approval_create: string;
}

export interface TwilioContentWhatsappTemplateTypes {
  'twilio/text': TwilioContentText;
  'twilio/media': TwilioContentMedia;
  'twilio/location': TwilioContentLocation;
  'twilio/quick-reply': TwilioContentButtons;
  'twilio/call-to-action': TwilioContentButtons;
  'twilio/list-picker': TwilioContentListPicker;
  'twilio/card': TwilioContentCard;
}

export interface TwilioContentButtons {
  body: string;
  actions: TwilioContentButtonsAction[];
}

export interface TwilioContentButtonsAction {
  title: string;
  id: string;
  type: string;
  url: string;
  phone: string;
}

export interface TwilioContentCard {
  title: string;
  subtitle: string;
  actions: TwilioContentButtonsAction[];
}

export interface TwilioContentListPicker {
  body: string;
  button: string;
  items: TwilioContentItem[];
}

export interface TwilioContentItem {
  item: string;
  description: string;
  id: string;
}

export interface TwilioContentLocation {
  latitude: number;
  longitude: number;
  label: string;
}

export interface TwilioContentMedia {
  body: string;
  media: string[];
}

export interface TwilioContentText {
  body: string;
}

export interface TwilioContentWhatsappTemplateVariables {
  additionalProp1: string;
  additionalProp2: string;
  additionalProp3: string;
}

export interface Meta {
  page: number;
  page_size: number;
  first_page_url: string;
  url: string;
  next_page_url: string;
  key: string;
}

export interface TwilioWhatsappTemplate {
  category: TemplateCategoryType;
  url: string;
  template_name: string;
  account_sid: string;
  languages: WhatsappTemplateLanguageElement[];
  sid: string;
  bookmarkId?: number;
  isBookmarked: boolean;
  bookmarkedAt?: string;
}

export interface Whatsapp360DialogTemplateResponse {
  total: number;
  offset: number;
  count: number;
  whatsAppTemplates: WhatsApp360DialogTemplate[];
}

export interface WhatsApp360DialogTemplate {
  isTemplateBookmarked: boolean;
  name: string;
  status: WhatsappTemplateStatus;
  language: string;
  category: string;
  components: Whatsapp360DialogTemplateComponent[];
  rejected_reason?: WhatsappTemplateRejectionReason;
  namespace: string;
  bookmarkId?: string;
}

export interface WhatsappTemplateLanguageElement {
  status: WhatsappTemplateStatus;
  language: string;
  date_updated: string;
  content: string;
  date_created: string;
  components?: WhatsappCloudAPITemplateComponent[];
  rejection_reason?: WhatsappTemplateRejectionReason;
}

// TODO: hack cause WhatsappTemplateComponentFormat is an enum
export const whatsappTemplateComponentFormatMapping = {
  text: 'TEXT',
  document: 'DOCUMENT',
  image: 'IMAGE',
  video: 'VIDEO',
} as const;

export type WhatsappTemplateComponentFormat =
  (typeof whatsappTemplateComponentFormatMapping)[keyof typeof whatsappTemplateComponentFormatMapping];

export type WhatsappTemplateButton =
  | WhatsappTemplateButtonPhoneNumberType
  | WhatsappTemplateButtonURLType
  | WhatsappTemplateButtonQuickReplyType
  | WhatsappTemplateButtonFlowType;

export const BUTTON_TYPE = {
  quickReply: 'QUICK_REPLY',
  url: 'URL',
  phoneNumber: 'PHONE_NUMBER',
  flow: 'FLOW',
} as const;

export type ButtonTypeKey = keyof typeof BUTTON_TYPE;
export type ButtonType = (typeof BUTTON_TYPE)[ButtonTypeKey];

export const WHATSAPP_TEMPLATE_COMPONENT_TYPE = {
  body: 'BODY',
  buttons: 'BUTTONS',
  footer: 'FOOTER',
  header: 'HEADER',
} as const;

export type WhatsappTemplateComponentType =
  (typeof WHATSAPP_TEMPLATE_COMPONENT_TYPE)[keyof typeof WHATSAPP_TEMPLATE_COMPONENT_TYPE];

export enum WhatsappTemplateRejectionReason {
  AbusiveContent = 'ABUSIVE_CONTENT',
  Empty = '',
  InvalidFormat = 'INVALID_FORMAT',
  None = 'NONE',
}

export enum WhatsappTemplateStatus {
  Approved = 'approved',
  Rejected = 'rejected',
  Unsubmitted = 'unsubmitted',
  Created = 'created',
}

export interface TargetedChannel {
  channel: string;
  ids?: string[];
}

export interface BroadcastUploadedFile {
  id: number;
  campaignUploadedFileId: string;
  companyMessageTemplateId: string;
  blobContainer: string;
  filename: string;
  url: string;
  mimeType: string;
}

export interface Whatsapp360DialogExtendedCampaignMessage {
  messageType: string;
  whatsapp360DialogTemplateMessage?: Whatsapp360DialogTemplateMessageType;
  whatsapp360DialogInteractiveObject?: Whatsapp360DialogInteractiveObjectType;
}

export interface FacebookMessengerExtendedMessagePayload {
  text: string;
}

export interface FacebookExtendedMessagePayloadDetail {
  facebookMessagePayload: FacebookMessengerExtendedMessagePayload;
}

export type TwilioExtendedMessagePayloadDetail = {
  whatsappTwilioContentApiObject: {
    contentSid: string;
  };
};

export type CampaignMessageExtendedMessagePayloadDetail =
  | TwilioExtendedMessagePayloadDetail
  | FacebookExtendedMessagePayloadDetail
  | WhatsappCloudExtendedMessagePayloadDetail;

export type MessageTagType =
  | 'ACCOUNT_UPDATE'
  | 'POST_PURCHASE_UPDATE'
  | 'CONFIRMED_EVENT_UPDATE';

export type ExtendedMessageType =
  (typeof ExtendedMessageType)[keyof typeof ExtendedMessageType];

export const ExtendedMessageType = {
  WhatsappTwilioContentTemplateMessage: 401,
  WhatsappCloudApiTemplateMessage: 101,
  WhatsappCloudApiInteractiveMessage: 102,
  WhatsappCloudApiContactsMessage: 103,
  WhatsappCloudApiLocationMessage: 104,
  WhatsappCloudApiReactionMessage: 105,
  WhatsappCloudApiTemplateButtonReplyMessage: 111,
  WhatsappCloudApiInteractiveReplyMessage: 112,
  WhatsappCloudApiContactsReplyMessage: 113,
  WhatsappCloudApiLocationReplyMessage: 114,
  WhatsappCloudApiOrderReplyMessage: 115,
  WhatsappCloudApiReactionReplyMessage: 116,
  FacebookOTNRequest: 201,
  FacebookOTNText: 202,
  FacebookOTNFile: 203,
  FacebookOTNInteractive: 204,
  FacebookInteractiveMessage: 205,
  InstagramInteractiveMessage: 301,
  adClickToMessengerMessage: 206,
  adClickToWhatsappMessage: 120,
} as const;

export interface CampaignChannelMessage {
  id?: number;
  targetedChannels: TargetedChannel[];
  targetedChannel: {
    channelType: string;
    channelIdentityId?: string;
  };
  templateContent: string;
  templateParams: string[];
  officialTemplateParams?: string[];
  uploadedFiles: BroadcastUploadedFile[];
  whatsApp360DialogExtendedCampaignMessage?: Whatsapp360DialogExtendedCampaignMessage;
  templateName?: string;
  messageTag?: MessageTagType;
  extendedMessageType?: ExtendedMessageType;
  facebookOTNTopicId?: string;
  extendedMessagePayloadDetail?: CampaignMessageExtendedMessagePayloadDetail;
}

export interface CreateBroadcastBody {
  automationActions: any[]; // TODO: to create type later
  broadcastAsNote: boolean;
  campaignChannelMessages: CampaignChannelMessage[];
  conditions: GetUserProfileCondition[];
  targetedChannels?: string[];
  targetedChannel: {
    channelType: string;
    channelIdentityId?: string;
  };
  targetedChannelWithIds: TargetedChannel[];
  templateName: string;
  scheduledAt?: string;
}

export interface CreateBroadcastResponse {
  id: string;
  companyId: string;
  templateName: string;
  templateParams: string[];
  status: string;
  conditions: Condition[];
  targetedChannels: string[];
  targetedChannel: {
    channelType: string;
    channelIdentityId: string;
  };
  targetedChannelWithIds: TargetedChannel[];
  broadcastHistoryCount: number;
  uploadedFiles: BroadcastUploadedFile[];
  createdAt: string;
  updatedAt: string;
  isBroadcastOn: boolean;
  broadcastAsNote: boolean;
  campaignChannelMessages: CampaignChannelMessage[];
  campaignAutomationActions: any[];
}

export interface CreateBroadcastWithTemplateRequest {
  conversationIds?: string[];
  userProfileIds?: string[];
  templeteId: string;
  params?: string[];
  isTestMessage?: boolean;
}

export interface CreateBroadcastWithTemplateResponse {
  broadcastTemplateId: string;
  targetAudience: number;
}

export interface UploadBroadcastAttachmentRequest {
  channelMessageId: number;
  files: File;
}

export interface UploadWhatsapp360DialogMediaFileRequest {
  whatsapp360DialogConfigId: string;
  displayName?: string;
  whatsappMediaType: 'DOCUMENT' | 'VIDEO' | 'IMAGE';
  isTemplateFile: boolean;
  file: File;
}

export interface UploadWhatsappCloudMediaFileRequest {
  ExtendedMessageType: string;
  DisplayName: string;
  MediaType: 'image' | 'video' | 'document';
  Channel: 'whatsappcloudapi';
  IsTemplateFile: boolean;
  File: File;
}

export interface UploadWhatsappCloudMediaFileResponse {
  id: string;
  channel: string;
  extendedMessageType: number;
  blobContainer: string;
  blobFilePath: string;
  filename: string;
  mimeType: string;
  url: string;
  fileSize: number;
  displayName: string;
  mediaType: string;
  createdAt: string;
  updatedAt: string;
}

export interface UploadWhatsapp360DialogMediaFileResponse {
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

export interface DeleteWhatsapp360DialogMediaFileRequest {
  whatsapp360DialogConfigId: string;
  fileId: string;
}

export interface DeleteWhatsapp360DialogMediaFileResponse {
  code: number;
  message: string;
  errorId: string;
  timestamp: string;
}

export interface QuickReplyLingualsType {
  id: number;
  language: string;
  params: string[];
  value: string;
}

export interface QuickReplyFileType {
  blobContainer: string;
  filename: string;
  id: number;
  mimeType: string;
  quickReplyFileId: string;
  url: string;
}

export interface QuickReplyResponse {
  list: QuickReply[];
}

export interface QuickReply {
  companyQuickReplyChildren: QuickReply[];
  companyQuickReplyLinguals: QuickReplyLingualsType[];
  directory: string;
  id: number;
  isFolder: boolean;
  order: number;
  type: number;
  updatedAt: Date;
  value: string;
  quickReplyFile?: QuickReplyFileType;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const REMARK_TYPE = {
  automationTriggered: 'automation-triggered',
  teamChangedAssignedConversation: 'conversation-assigned-team-changed',
  assigneeChangedConversation: 'conversation-assignee-changed',
  collaboratorAddedConversation: 'conversation-collaborator-added',
  collaboratorRemovedConversation: 'conversation-collaborator-removed',
  labelAddedConversation: 'conversation-label-added',
  labelRemovedConversation: 'conversation-label-removed',
  readConversation: 'conversation-read',
  statusChangedConversation: 'conversation-status-changed',
  manualLog: 'manual-log',
  profileAddedToList: 'user-profile-added-to-list',
  profileFieldsChanged: 'user-profile-fields-changed',
  profileRemovedFromList: 'user-profile-removed-from-list',
} as const;

export type RemarkType = (typeof REMARK_TYPE)[keyof typeof REMARK_TYPE];

export interface RemarksStaff {
  userInfo: UserInfo;
  staffId: number;
  roleType: RoleType;
  name: string;
  locale: string;
  timeZoneInfoId: string;
  position: string;
  status: string;
  isAcceptedInvitation: boolean;
  isShowName: boolean;
  isNewlyRegistered: boolean;
  qrCodeIdentity?: string;
  qrCodeChannel?: TargetedChannelWithIds;
}

export interface Country {
  id: number;
  value: string;
  customUserProfileFieldOptionLinguals: Linguals[];
}

export interface GetFacebookOTNTopicResponse {
  id: string;
  pageId: string;
  topic: string;
  topicStatus: string;
  hashTagIds: string[];
}

export interface GetFacebookOTNAvailableRecipientsResponse {
  totalRecipients: number;
  otnAvailableRecipients: number;
}

export type BroadcastStatus =
  | 'Error'
  | 'Completed'
  | 'Processing'
  | 'Queued'
  | 'Scheduled'
  | 'Draft'
  | 'Sent'
  | 'Sending'
  | 'Paused'
  | 'Exceeded Quota';

export interface GetBroadcastResponse {
  id: string;
  companyId: string;
  templateName: string;
  templateParams: string[];
  status: BroadcastStatus;
  conditions: GetUserProfileCondition[];
  targetedChannels: string[];
  targetedChannel: {
    channelType: string;
    channelIdentityId: string;
  };
  targetedChannelWithIds: QrCodeChannel[];
  broadcastHistoryCount: number;
  uploadedFiles: BroadcastUploadedFile[];
  createdAt: string;
  updatedAt: string;
  sentAt: string;
  savedBy: By;
  lastSentBy: By;
  isBroadcastOn: boolean;
  statisticsData: StatisticsData;
  broadcastAsNote: boolean;
  scheduledAt?: string;
  campaignChannelMessages: CampaignChannelMessage[];
  campaignAutomationActions: any[];
}

export interface QrCodeChannel {
  channel: string;
  ids: string[];
}

export interface By {
  userInfo: UserInfo;
  staffId: number;
  roleType: string;
  name: string;
  locale: string;
  timeZoneInfoId: string;
  position: string;
  status: string;
  isAcceptedInvitation: boolean;
  isShowName: boolean;
  isNewlyRegistered: boolean;
  qrCodeIdentity: string;
  qrCodeChannel: QrCodeChannel;
}

// eslint-disable-next-line import/export -- TODO: fix duplicate export UserInfo
export interface UserInfo {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  userName: string;
  email: string;
  phoneNumber: string;
  emailConfirmed: boolean;
  createdAt: string;
}

export interface WhatsappCloudTemplateResponse {
  whatsappTemplates: WhatsappCloudTemplate[];
}

export interface WhatsappCloudTemplate {
  category: TemplateCategoryType | string;
  id: string;
  language: string;
  name: string;
  status: string | 'APPROVED' | 'REJECTED';
  components: WhatsappCloudAPITemplateComponent[];
  is_template_bookmarked: boolean;
}

export interface WhatsappTemplateResponse {
  whatsappTemplates: WhatsappTemplate[];
}

export interface WhatsappTemplate {
  category: TemplateCategoryTypeKey | '';
  id: string;
  language: TemplateLanguageOptionKey;
  name: string;
  status: TemplateApprovalStatusAllKey;
  components: WhatsappCloudAPITemplateComponent[];
  is_template_bookmarked: boolean;
  buttonType: TemplateButtonTypeKey;
  rejected_reason: string;
  // for separate form validation logic for dialog form
  isAdditionDialogOpen?: boolean;
}

export interface WebClientInfo {
  onlineStatus: string;
  results: WebClientInfoResult[];
  total: number;
}

export interface WebClientInfoResult {
  id: number;
  webClientSenderId: number;
  webPath: string;
  ipAddress: string;
  ipAddressType: string;
  country: string;
  organisationName: string;
  businessName: string;
  businessWebsite: string;
  isp: string;
  timezone: string;
  region: string;
  city: string;
  countryCode: string;
  locale: string;
  createdAt: string;
  updatedAt: string;
}

export interface CurrencyMap {
  currency: string;
  platformCountry: string;
}

export interface SupportedCurrencies {
  stripeSupportedCurrenciesMappings: CurrencyMap[];
}

export interface GeneratePaymentPayload {
  expiredAt: string;
  lineItems: PaymentBreakdown[];
  platformCountry: string;
  userprofileId: string;
}

export interface StripeCurrency {
  currency: string;
  platformCountry: string;
}

export interface CustomCurrency {
  currency_iso_code: string;
  currency_name: string;
  currency_symbol: string;
}

export type Currency = StripeCurrency | CustomCurrency;

export interface PaymentLink {
  stripePaymentRecordId: number;
  paymentIntentId: string;
  trackingUrl: string;
  url: string;
}

interface StripePlan {
  id: string;
  amount: number;
  currency: string;
  version: number;
}

export interface StripeSetUp {
  publicKey: string;
  plans: StripePlan[];
  supportedCountries: any[];
  billRecord: BillRecord;
}

// TODO: replace by ipgeolocation.io response, https://app.clickup.com/t/9008009945/DEVS-4274
export interface GetCurrentCountryResponse {
  countryCode2: string;
  countryCode3: string;
  countryName: string;
  stateProvince: string;
  city: string;
  district: string;
  zipCode: string;
  latitude: string;
  longitude: string;
  currency: {
    currencyName: string;
    currencyCode: string;
    currencySymbol: string;
  };
}

export interface BroadcastStatistic {
  delivered: number;
  failed: number;
  read: number;
  replied: number;
  sent: number;
  updatedAt: string;
}

export interface FacebookUser {
  id: string;
  name: string;
  email: string;
  locale: string;
  pageId: string;
  profile_pic: string;
}

export interface WhatsappUser {
  id: string;
  locale: string;
  phone_number: string;
  name: string;
  instanceId: string;
  profile_pic?: string;
  is_group: boolean;
  is_twilio: boolean;
}

export interface WhatsApp360DialogUser {
  channelId: number;
  companyId: string;
  contactStatus: ContactStatusEnum;
  createdAt: string;
  id: number;
  name: string;
  phoneNumber: string;
  updatedAt: string;
  whatsAppId: string;
}
// eslint-disable-next-line import/export -- TODO: fix duplicate export WhatsappCloudApiUser
export interface WhatsappCloudApiUser {
  whatsappId: string;
  whatsappUserDisplayName: string;
  whatsappChannelPhoneNumber: string;
}

export interface LineUser {
  userId: string;
  displayName: string;
  pictureUrl: string;
  channelIdentityId: string;
}

export interface TelegramUser {
  id: number;
  companyId: string;
  firstName: string;
  lastName: string;
  type: string;
  telegramChatId: number;
  telegramBotId: number;
}

export interface ViberUser {
  id: number;
  companyId: string;
  viberUserId: string;
  displayName: string;
  viberBotId: string;
  isSubscribed: boolean;
  channelIdentityId: string;
}

export interface SmsUser {
  id: string;
  locale: string;
  phone_number: string;
  name: string;
}

export interface InstagramUser {
  companyId: string;
  instagramId: string;
  instagramPageId: string;
  username: string;
}

export interface WeChatUser {
  openid: string;
  nickname: string;
  language: string;
  headimgurl: string;
}

export type WhatsappCloudAPITemplateBodyComponent = {
  text: string;
  type: 'BODY';
  example?: {
    body_text: string[][];
  };
};

export type WhatsappCloudAPITemplateHeaderComponent =
  | WhatsappCloudAPITemplateHeaderFileComponent
  | WhatsappCloudAPITemplateHeaderTextComponent;

export type WhatsappCloudAPITemplateHeaderTextComponent = {
  type: 'HEADER';
  text: string;
  format: 'TEXT';
};

export type WhatsappCloudAPITemplateHeaderImageComponent = {
  format: 'IMAGE';
  type: 'HEADER';
  example: {
    header_handle: string[];
  };
};

export type WhatsappCloudAPITemplateHeaderVideoComponent = {
  format: 'VIDEO';
  type: 'HEADER';
  example: {
    header_handle: string[];
  };
};

export type WhatsappCloudAPITemplateHeaderDocumentComponent = {
  format: 'DOCUMENT';
  type: 'HEADER';
  example: {
    header_handle: string[];
  };
};

export type WhatsappCloudAPITemplateHeaderFileComponent =
  | WhatsappCloudAPITemplateHeaderImageComponent
  | WhatsappCloudAPITemplateHeaderVideoComponent
  | WhatsappCloudAPITemplateHeaderDocumentComponent;

export type WhatsappCloudAPITemplateFooterComponent = {
  text: string;
  type: 'FOOTER';
};

export interface WhatsappTemplateButtonQuickReplyType {
  text: string;
  type: typeof BUTTON_TYPE.quickReply;
}

export interface WhatsappTemplateButtonFlowType {
  text: string;
  type: typeof BUTTON_TYPE.flow;
  flow_id?: string;
}

export interface WhatsappTemplateButtonURLType {
  text: string;
  type: typeof BUTTON_TYPE.url;
  url: string;
  example: string[];
  url_type?: 'dynamic-url' | 'static-url';
}

export type WhatsappTemplateButtonPhoneNumberType = {
  text: string;
  type: typeof BUTTON_TYPE.phoneNumber;
  phone_number: string;
};

export type WhatsappCloudAPITemplateButtonComponent = {
  type: 'BUTTONS';
  buttons: WhatsappTemplateButton[];
};

export type Whatsapp360DialogTemplateHeaderImageComponent = {
  format: 'IMAGE';
  type: 'HEADER';
  code_expiration_minutes: number;
  add_security_recommendation: boolean;
};

export type Whatsapp360DialogTemplateHeaderVideoComponent = {
  format: 'VIDEO';
  type: 'HEADER';
  code_expiration_minutes: number;
  add_security_recommendation: boolean;
};

export type Whatsapp360DialogTemplateHeaderDocumentComponent = {
  format: 'DOCUMENT';
  type: 'HEADER';
  code_expiration_minutes: number;
  add_security_recommendation: boolean;
};

export type Whatsapp360DialogTemplateHeaderTextComponent = {
  type: 'HEADER';
  text: string;
  format: 'TEXT';
  code_expiration_minutes: number;
  add_security_recommendation: boolean;
};

export type Whatsapp360DialogTemplateHeaderFileComponent =
  | Whatsapp360DialogTemplateHeaderImageComponent
  | Whatsapp360DialogTemplateHeaderVideoComponent
  | Whatsapp360DialogTemplateHeaderDocumentComponent;

export type Whatsapp360DialogTemplateHeaderComponent =
  | Whatsapp360DialogTemplateHeaderFileComponent
  | Whatsapp360DialogTemplateHeaderTextComponent;

export type Whatsapp360DialogTemplateButtonComponent = {
  type: 'BUTTONS';
  add_security_recommendation: boolean;
  code_expiration_minutes: number;
  buttons: WhatsappTemplateButton[];
};

export type Whatsapp360DialogTemplateBodyComponent = {
  text: string;
  type: 'BODY';
  code_expiration_minutes: number;
  add_security_recommendation: boolean;
};

export type Whatsapp360DialogTemplateFooterComponent = {
  text: string;
  type: 'FOOTER';
  code_expiration_minutes: number;
  add_security_recommendation: boolean;
};

export type Whatsapp360DialogTemplateComponent =
  | Whatsapp360DialogTemplateButtonComponent
  | Whatsapp360DialogTemplateBodyComponent
  | Whatsapp360DialogTemplateFooterComponent
  | Whatsapp360DialogTemplateHeaderComponent;

export type WhatsappCloudAPITemplateComponent =
  | WhatsappCloudAPITemplateButtonComponent
  | WhatsappCloudAPITemplateBodyComponent
  | WhatsappCloudAPITemplateHeaderComponent
  | WhatsappCloudAPITemplateFooterComponent;

export interface FacebookConnectRecord {
  data: {
    access_token: string;
    category: string;
    category_list: {
      id: string;
      name: string;
    }[];
    name: string;
    id: string;
    tasks: string[];
  }[];
  paging: {
    cursors: {
      before: string;
      after: string;
    };
  };
  business_integration_system_user_access_token?: string;
}

export type UserProfileConversation = {
  conversationId: string;
  companyId: string;
  conversationChannels: string[];
  messageGroupName: string;
  status: string;
  additionalAssignees: { assignee: Assignee }[];
  conversationHashtags: Hashtag[];
  updatedTime: string;
  modifiedAt: string;
  unreadMessageCount: number;
  isSandbox: boolean;
  isBookmarked: boolean;
};

export interface WhatsappCloudApiConfigDetail {
  id: number;
  companyId: string;
  channelName: string;
  messagingHubWabaPhoneNumberId: string;
  messagingHubWabaId: string;
  whatsappPhoneNumber: string;
  whatsappDisplayName: string;
  facebookWabaName: string;
  facebookWabaBusinessName: string;
  facebookWabaBusinessId: string;
  facebookWabaId: string;
  facebookPhoneNumberId: string;
  templateNamespace: string;
  facebookWabaBusinessVerificationStatus: string;
  facebookPhoneNumberIsPinEnabled: boolean;
  facebookPhoneNumberStatus: string;
  facebookPhoneNumberQualityRating: string;
  facebookPhoneNumberNameStatus: string;
  facebookPhoneNumberNewNameStatus: string;
  facebookPhoneNumberAccountMode: string;
  facebookPhoneNumberCodeVerificationStatus: string;
  facebookPhoneNumberIsOfficialBusinessAccount: string;
  facebookPhoneNumberMessagingLimitTier: keyof typeof MessagingLimitType;
  accessLevel: number;
  channelIdentityId: string;
  facebookPhoneNumberQualityScore?: {
    score: string;
    date: string;
  };
  isOptInEnable: boolean;
  optInConfig?: {
    templateName: string;
    language: string;
    templateMessageContent?: string;
    readMoreTemplateButtonMessage?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ConnectWhatsappCloudApiResponse {
  connectedWhatsappCloudApiConfig: WhatsappCloudApiConfigDetail;
}

export interface WabaPhoneNumber {
  facebookPhoneNumber: string;
  facebookPhoneNumberVerifiedName: string;
  facebookPhoneNumberId: string;
  messagingHubWabaPhoneNumberId: string;
  facebookPhoneNumberNameStatus: string;
  facebookPhoneNumberStatus: string;
}

interface UnconnectedWabaPhoneNumberChannel {
  whatsappDisplayName: string;
  facebookWabaAccountReviewStatus: string;
  facebookWabaBusinessName: string;
  facebookWabaId: string;
  facebookWabaName: string;
  messagingHubWabaId: string;
  wabaDtoPhoneNumbers: WabaPhoneNumber[];
}

export interface GetWabaChannelsResponse {
  unconnectedWabaPhoneNumberChannels: UnconnectedWabaPhoneNumberChannel[];
  whatsappCloudApiConfigs: WhatsappCloudApiConfig[];
}

export type GetWabaWithChannelsResponse = {
  whatsappCloudApiByWabaIdConfigs: WhatsappCloudApiByWabaIdConfig[];
};

export type WhatsappCloudApiByWabaIdConfig = {
  wabaAccountId: string;
  messagingHubWabaId: string;
  wabaName: string;
  templateNamespace: string;
  facebookWabaBusinessId: string;
  facebookWabaId: string;
  facebookPhoneNumberId: string;
  whatsappCloudApiConfigs?: WhatsappCloudApiConfigDetail[];
};

type WhatsappCloudApiConfig = ConnectWhatsappCloudApiResponse;

export interface CreateStripeCheckoutResponse {
  id: string;
  cancel_url: string;
  payment_status: string;
  url: string;
  success_url: string;
}

export interface ConnectWeChatResponse {
  name: string;
  appId: string;
  connectedDataTime: string;
  isShowInWidget: boolean;
}

export interface GetWeChatWebHookUrlResponse {
  Url: string;
}

export interface SendQrCodeResponse {
  message: string;
  url: string;
}

export interface InstagramConnectRecord {
  data: {
    access_token: string;
    category: string;
    category_list: {
      id: string;
      name: string;
    }[];
    name: string;
    id: string;
    tasks: string[];
  }[];
  paging: {
    cursors: {
      before: string;
      after: string;
    };
  };
  business_integration_system_user_access_token?: string;
}

export interface ConnectTelegramResponse {
  id: number;
  displayName: string;
  telegramBotId: number;
  telegramBotDisplayName: string;
  telegramBotUserName: string;
  connectedDateTime: string;
  isShowInWidget: boolean;
  telegramDeeplink: string;
}

export type CompanyKeyApiResponse = {
  apiKey: string;
  permissions: string[];
  createdAt: string;
  callLimit: number | null;
  calls: number;
  keyType: string;
};

export type UserProfileImportValidateResponse = {
  currentNumberOfContacts: number;
  maximumNumberOfContacts: number;
  numberOfNewContacts: number;
  numberOfToBeUpdatedContacts: number;
  validateSucceeded: boolean;
};

export type CompanyUsageResponse = {
  billingPeriodUsages: {
    billRecord: BillRecord;
    totalMessagesSentFromSleekflow: number;
  }[];
  usageCycleDateTimeRange: {
    from: string;
    to: string;
  };
  maximumAutomatedMessages: number;
  maximumContacts: number;
  totalChannelAdded: number;
  totalContacts: number;
  totalConversations: number;
  totalMessages: number;
  totalMessagesSentFromSleekFlow: number;
  currentNumberOfChannels: number;
  maximumNumberOfChannel: number;
  maximumAgents: number;
  maximumAPICalls: number;
  totalAgents: number;
  currentFlowBuilderFlowEnrolmentUsage: number;
  maximumFlowBuilderFlowEnrolmentUsage: number;
};

export const AUDIT_LOGS_FILTER_TYPES = {
  automationTriggered: 'automation-triggered',
  conversationAssignedTeamChanged: 'conversation-assigned-team-changed',
  conversationAssigneeChanged: 'conversation-assignee-changed',
  conversationCollaboratorAdded: 'conversation-collaborator-added',
  conversationCollaboratorRemoved: 'conversation-collaborator-removed',
  conversationLabelAdded: 'conversation-label-added',
  conversationLabelRemoved: 'conversation-label-removed',
  conversationRead: 'conversation-read',
  conversationChannelSwitched: 'conversation-channel-switched',
  conversationStatusChanged: 'conversation-status-changed',
  userProfileImported: 'user-profile-imported',
  userProfileRemovedFromList: 'user-profile-removed-from-list',
  userProfileFieldsChanged: 'user-profile-fields-changed',
  userProfileAddedToList: 'user-profile-added-to-list',
  userProfileChatHistoryBackedUp: 'user-profile-chat-history-backed-up',
  userProfileEnrolledIntoFlowhubWorkflow:
    'user-profile-enrolled-into-flowhub-workflow',
  manualLog: 'manual-log',
} as const;

export type AuditLogsFilterType =
  (typeof AUDIT_LOGS_FILTER_TYPES)[keyof typeof AUDIT_LOGS_FILTER_TYPES];

type AuditLogsData =
  | {
      type: (typeof AUDIT_LOGS_FILTER_TYPES)['automationTriggered'];
      data: {
        automation_name: string;
        automation_action_type: string; // might be enum?;
        automation_action_log_id: number;
        automation_status: string; // might be enum?;
        automation_failed_error_message: string;
      };
    }
  | {
      type: (typeof AUDIT_LOGS_FILTER_TYPES)['conversationAssignedTeamChanged'];
      data: {
        new_team: null | {
          name: string;
          team_id: number;
        };
        original_team: null | {
          name: string;
          team_id: number;
        };
      };
    }
  | {
      type: (typeof AUDIT_LOGS_FILTER_TYPES)['conversationAssigneeChanged'];
      data: {
        new_assignee: null | {
          assignee_id: string;
          name: string;
        };
        original_assignee: null | {
          assignee_id: string;
          name: string;
        };
      };
    }
  | {
      type: (typeof AUDIT_LOGS_FILTER_TYPES)['conversationCollaboratorAdded'];
      data: {
        collaborators_added: {
          assignee_id: string;
          name: string;
        }[];
      };
    }
  | {
      type: (typeof AUDIT_LOGS_FILTER_TYPES)['conversationCollaboratorRemoved'];
      data: {
        collaborators_removed: {
          assignee_id: string;
          name: string;
        }[];
      };
    }
  | {
      type: (typeof AUDIT_LOGS_FILTER_TYPES)['conversationLabelAdded'];
      data: {
        labels_added: { label: string }[];
      };
    }
  | {
      type: (typeof AUDIT_LOGS_FILTER_TYPES)['conversationLabelRemoved'];
      data: {
        labels_removed: { label: string }[];
      };
    }
  | {
      type: (typeof AUDIT_LOGS_FILTER_TYPES)['conversationRead'];
      data: {
        read_staff: {
          assignee_id: string;
          name: string;
        };
      };
    }
  | {
      type: (typeof AUDIT_LOGS_FILTER_TYPES)['conversationChannelSwitched'];
      data: {
        channel_id: string;
        channel_name: string;
        channel_type: string;
        phone_number: number;
      };
    }
  | {
      type: (typeof AUDIT_LOGS_FILTER_TYPES)['conversationStatusChanged'];
      data: {
        new_status: 'Open' | 'Closed';
        original_status: 'Open' | 'Closed';
        scheduled_time: null;
      };
    }
  | {
      type: (typeof AUDIT_LOGS_FILTER_TYPES)['userProfileRemovedFromList'];
      data: {
        user_profile_removed_from_list: {
          list_id: number;
          name: string;
        };
      };
    }
  | {
      type: (typeof AUDIT_LOGS_FILTER_TYPES)['userProfileFieldsChanged'];
      data: {
        changed_fields: {
          field_name: string;
          value: string;
        }[];
      };
    }
  | {
      type: (typeof AUDIT_LOGS_FILTER_TYPES)['userProfileAddedToList'];
      data: {
        user_profile_added_to_list: {
          list_id: number;
          name: string;
        };
      };
    }
  | {
      type: (typeof AUDIT_LOGS_FILTER_TYPES)['userProfileChatHistoryBackedUp'];
    }
  | {
      type: (typeof AUDIT_LOGS_FILTER_TYPES)['userProfileEnrolledIntoFlowhubWorkflow'];
    }
  | {
      type: (typeof AUDIT_LOGS_FILTER_TYPES)['manualLog'];
      updated_time?: string;
    };

export type AuditLogResponseDatum = {
  sleekflow_company_id: string;
  sleekflow_user_profile_id: string;
  sleekflow_staff_id?: string;
  audit_log_text: string;
  created_time: string;
  updated_time?: string;
  updated_by?: { sleekflow_staff_id: string };
  id: string;
  sys_type_name: 'UserProfileAuditLog';
} & AuditLogsData;

export type CloudApiBalanceResponse = WhatsappCloudApiUsageRecord[];

export type CloudApiBalance = {
  updated_at: string;
  facebook_business_id: string;
  facebook_business_name: string;
  created_at: string;
  balance: Money;
};

export type AutoTopUpProfileResponse = {
  business_balance_auto_top_up_profile: AutoTopUpProfile;
};

export interface AutoTopUpProfile {
  facebook_business_id: string;
  facebook_waba_id?: string;
  minimum_balance: Money;
  auto_top_up_plan: {
    id: string;
    name: string;
    price: Money;
  };
  is_auto_top_up_enabled: boolean;
}

export type WabaAutoTopUpProfileResponse = {
  business_balance_auto_top_up_profiles: AutoTopUpProfile[];
};

export type AutoTopUpMutationParam = {
  autoTopUpProfile: AutoTopUpProfile;
  redirect_to_url: string;
};

export type AutoTopUpOptionsResponse = {
  minimum_balances: Money[];
  auto_top_up_plans: AutoTopUpPlan[];
};

export type AutoTopUpPlan = {
  id: string;
  name: string;
  price: Money;
};
export const MessagingLimitType = {
  TIER_50: 50,
  TIER_250: 250,
  TIER_1K: 1000,
  TIER_10K: 10000,
  TIER_100K: 100000,
  TIER_UNLIMITED: '∞',
} as const;

export type DeleteTwilioChannelRequest = { twilioAccountId: string };
export type DeleteCloudApiChannelRequest = {
  messagingHubWabaId: string;
  messagingHubWabaPhoneNumberId: string;
};
export type Delete360ApiChannelRequest = {
  id: string;
};
export type DeleteSmsChannelRequest = DeleteTwilioChannelRequest;
export type DeleteFacebookChannelRequest = { pageId: string };
export type DeleteInstagramChannelRequest = { instagramPageId: string };
export type DeleteLineChannelRequest = { channelID: string };
export type DeleteWeChatChannelRequest = { appId: string };
export type DeleteTelegramChannelRequest = { id: number };
export type DeleteViberChannelRequest = { id: number };
export type RenameViberChannelRequest = {
  id: number;
  newName: string;
  viberBotSenderName: string;
};
export type RenameTelegramChannelRequest = {
  id: number;
  newName: string;
};
export type RenameWeChatChannelRequest = {
  appId: string;
  newName: string;
};

export type RenameLineChannelRequest = {
  channelID: string;
  newName: string;
};

export type RenameFacebookChannelRequest = {
  pageId: string;
  newName: string;
};

export type RenameSmsChannelRequest = {
  twilioAccountId: string;
  newName: string;
};

export type Rename360DialogChannelRequest = {
  id: string;
  newName: string;
};

export type RenameCloudApiChannelRequest = {
  messagingHubWabaId: string;
  messagingHubWabaPhoneNumberId: string;
  newName: string;
};

export type RenameTwilioChannelRequest = {
  twilioAccountId: string;
  newName: string;
  newSID: string;
};

export type UserPersonalColumnsPreferencesNormalized = Readonly<
  Array<{
    field_id: string;
    order: number;
    is_visible: boolean;
  }>
>;

export type UserPersonalColumnPreferenceDenormalized = {
  fieldId: string;
  order: number;
  isVisible: boolean;
};

export const CompanyTypeDict = {
  regularClient: 0,
  reseller: 1,
  resellerClient: 2,
} as const;
export type CompanyTypeDictType = typeof CompanyTypeDict;

export const HttpStatusCodeDict = {
  unAuthorized: 401,
  forbidden: 403,
  notFound: 404,
} as const;

export const ServiceTypeDict = {
  onboarding_support: 'onboarding_support',
  business_consultancy_service: 'business_consultancy_service',
  flow_automation: 'flow_automation',
} as const;
export type ServiceTypes = keyof typeof ServiceTypeDict;
export const ServiceStatusDict = {
  available: 'available',
  included_in_plan: 'included_in_plan',
  purchased: 'purchased',
  contactUs: 'contactUs',
  cancel: 'base_subscription_plan_on_cancelling',
} as const;
export type ServiceStatusDictType =
  (typeof ServiceStatusDict)[keyof typeof ServiceStatusDict];

export type SupportServiceResponseType = {
  id: string;
  type: ServiceTypes;
  amount: number;
  currency: string;
  baseQuantity: number;
  purchasedQuantity: number;
  status: ServiceStatusDictType;
};
export type AvailablePlansType = {
  amount: number;
  currency: string;
  id: string;
  subscriptionInterval: SubscriptionPeriod;
  subscriptionTier: AvailableSubscribePlanName;
};

export type HighlightedFeaturesType = {
  includedUserAccounts: number;
  maximumUserAccounts: number;
  includedContacts: number;
  broadcastMessageQuota: number;
  activeFlowBuilderCount: number;
  automationRuleCount: number;
};

type CurrencyRates = {
  [currencyCode: string]: number;
};

type LicenseFeeType = {
  pro: CurrencyRates;
  premium: CurrencyRates;
  enterprise: CurrencyRates;
};

export type FeaturesDetailType = {
  wabaPhoneNumberLicenseFee: LicenseFeeType;
};

export type SubscriptionPlansResponseType = {
  availableCurrencies: string[];
  currentSubscriptionPlanTier: string;
  currentSubscriptionPlanInterval: string;
  availablePlans: AvailablePlansType[];
  highlightedFeatures: {
    pro: HighlightedFeaturesType;
    premium: HighlightedFeaturesType;
  };
  featuresDetails: FeaturesDetailType;
};

export interface TwilioUsage {
  id: number;
  start: string;
  end: string;
  description: string;
  companyId: string;
  twilioAccountId: string;
  totalCreditValue: number;
  totalPrice: number;
  currency: string;
  balance: number;
  isVerified: boolean;
}

export type TicketOverview =
  TravisBackendTicketingHubDomainViewModelsGetSchemafulTicketDto;

export type TicketDetails = SleekflowApisTicketingHubModelTicketDto;

export enum TicketPermissionAction {
  CREATE_TICKET = 'createTicket',
  DELETE_TICKET = 'deleteTicket',
}
export enum TicketPermissionType {
  ROLE = 'role',
}

export type TicketPermissionSets = {
  [action in TicketPermissionAction]: {
    [type in TicketPermissionType]: Set<RoleType | string>;
  };
};

export const TICKET_PERMISSION_ACTIONS = [
  TicketPermissionAction.CREATE_TICKET,
  TicketPermissionAction.DELETE_TICKET,
];

export const TICKET_PERMISSION_ROLES = [
  RoleType.ADMIN,
  RoleType.TEAMADMIN,
  RoleType.STAFF,
];

export type CustomObjectDataPropertyValues = Record<
  string,
  string[] | number | string | boolean
>;
export type CustomObjectDataArrayObjectPropertyValue = {
  created_at: string;
  id: string;
  property_values: CustomObjectDataPropertyValues;
};

type ReferencedUserProfile = {
  id: string;
  first_name: string;
  last_name: string;
};

export type CustomObjectDataFromApi = {
  id: string;
  schema_id: string;
  property_values: CustomObjectDataPropertyValues;
  primary_property_value: string;
  referenced_user_profile: ReferencedUserProfile;
  created_by?: {
    sleekflow_staff_id: string;
    sleekflow_staff_team_ids: string[];
  };
  updated_by?: {
    sleekflow_staff_id: string;
    sleekflow_staff_team_ids: string[];
  };
  created_at: string;
  updated_at: string;
};

export type WorkingHoursItem = {
  start?: string;
  end?: string;
  cross_day?: boolean;
};

export type WorkingHours = {
  version: string;
  '1': WorkingHoursItem[];
  '2': WorkingHoursItem[];
  '3': WorkingHoursItem[];
  '4': WorkingHoursItem[];
  '5': WorkingHoursItem[];
  '6': WorkingHoursItem[];
  '7': WorkingHoursItem[];
};

export type WorkingHoursResponse = {
  isEnabled: boolean;
  weeklyHours: WorkingHours;
  updatedAt: string;
};

export type ConversationPermission = {
  staffId: number;
  staffIdentityId: string;
  canView: boolean;
  canSend: boolean;
  inboxView: {
    assignedToMe: boolean;
    mentions: boolean;
    collaborations: boolean;
    teamInboxes: Record<number, boolean>;
    all: boolean;
  };
};

export type AnalyticsCommonMtrics = {
  date?: string;
  numberOfAllConversations: number;
  numberOfActiveConversations: number;
  numberOfMessagesSent: number;
  numberOfMessagesReceived: number;
  numberOfMessagesFailed: number;
  responseTimeForAllMessages: number;
  responseTimeForFirstMessages: number;
  resolutionTime: number;
  numberOfNewEnquires: number;
  numberOfNewContacts: number;
};

export type AnalyticsCommonMtricsResponseType = {
  startDate: string;
  endDate: string;
  summary: AnalyticsCommonMtrics;
  dailyLogs: AnalyticsCommonMtrics[];
  lastUpdateTime: string;
};

type AnalyticsBroadcastMtrics = {
  date?: string;
  numberOfBroadcastSent: number;
  numberOfBroadcastBounced: number;
  numberOfBroadcastDelivered: number;
  numberOfBroadcastRead: number;
  numberOfBroadcastReplied: number;
};

export type AnalyticsBroadcastMtricsResponseType = {
  startDate: string;
  endDate: string;
  summary: AnalyticsBroadcastMtrics;
  dailyLogs: AnalyticsBroadcastMtrics[];
};
