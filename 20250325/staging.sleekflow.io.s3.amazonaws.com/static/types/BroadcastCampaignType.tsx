import {
  UploadedBroadcastFileType,
  UploadedFileGeneralProxyType,
} from "./UploadedFileType";
import { FilterConfigType } from "./FilterConfigType";
import {
  ChannelConfiguredType,
  ChannelType,
} from "component/Chat/Messenger/types";
import { ConditionNameType } from "config/ProfileFieldMapping";
import { LogicType } from "./AssignmentRuleType";
import { StaffType } from "./StaffType";
import { WhatsappTemplateNormalizedType } from "./WhatsappTemplateResponseType";
import { WhatsApp360DialogExtendedCampaignMessageType } from "api/Broadcast/fetchBroadcastCampaign";
import { GenericSendWhatsappTemplate } from "App/reducers/Chat/whatsappTemplatesReducer";
import { AutomationActionType } from "./AutomationActionType";
import { FacebookOTNStateType } from "../features/Facebook/models/FacebookOTNTypes";
import { PaymentLinkSetType } from "core/models/Ecommerce/Payment/PaymentLinkType";
import { OptInContentType } from "features/Whatsapp360/models/OptInType";
import {
  ExtendedMessageType,
  WhatsappTwilioContentMessageType,
} from "core/models/Message/WhatsappCloudAPIMessageType";
import {
  TemplateMessageComponentType,
  Whatsapp360DialogTemplateMessageComponentFooterType,
} from "types/MessageType";

export interface AudienceType {
  fieldName: string;
  fieldDisplayName?: string;
  fieldType?: string;
  filterValue: string[];
  filterCondition: string;
  nextOperator?: LogicType;
  type?: string;
  uuid?: string;
}

export interface BroadcastCampaignResponseType {
  broadcastHistoryCount: number;
  broadcastSentCount: number;
  companyId: string;
  conditions: AudienceFilterConditionType[];
  createdAt: string;
  id: string;
  status: string;
  targetedChannels: string[];
  targetedChannelWithIds: TargetedChannelType[];
  templateContent: string;
  templateName: string;
  templateParams: string[];
  updatedAt: string;
  uploadedFiles: UploadedBroadcastFileType[];
  isBroadcastOn: boolean;
  campaignChannelMessages: BroadcastCampaignChannelMessageType[];
}

export interface BroadcastCampaignStatisticsType {
  read: number;
  delivered: number;
  sent: number;
  replied: number;
}

export interface BroadcastCampaignRealTimeStatisticsType
  extends BroadcastCampaignStatisticsType {
  failed: number;
  updatedAt: string;
}

export default interface BroadcastCampaignType {
  id: string;
  status?: string;
  name: string;
  createdBy?: StaffType;
  channels: string[];
  channelsWithIds: TargetedChannelType[];
  channelWithId?: TargetedChannelType;
  otherChannelsWithIds?: TargetedChannelType[];
  scheduledAt?: string;
  sent?: number;
  read?: number;
  reply?: number;
  delivered?: number;
  readRate?: string;
  deliveredRate?: string;
  replyRate?: string;
  lastUpdated: string;
  content: string;
  selectedTemplate?: WhatsappTemplateNormalizedType;
  startDate?: string;
  time?: string;
  audienceTypes?: AudienceType[];
  contactLists?: number[];
  params: string[];
  uploadedFiles: UploadedBroadcastFileType[];
  filterList?: FilterConfigType[];
  tmpFileList?: File[];
  bannerMessage?: string;
  broadcastHistoryCount?: number;
  companyChannels?: ChannelConfiguredType<any>[];
  addAttachment?: () => void;
  templateSelection: boolean;
  selectedAll: boolean;
  totalChannels: number;
  isBroadcastOn: boolean;
  campaignChannelMessages: ChannelMessageType[];
  selectedChannel?: ChannelType;
  isNoteModalOpen?: boolean;
  automationActions?: AutomationActionType[];
  stripePaymentRequestOption?: PaymentLinkSetType;
}

export type ChannelMessageType = {
  id?: number;
  content: string;
  uploadedFiles: UploadedBroadcastFileType[];
  params: string[];
  mode?: string;
  sendWhatsAppTemplate?: SendWhatsappTemplateState;
  templateLanguage?: string;
  targetedChannelWithIds: TargetedChannelType[];
  templateName?: string;
  whatsApp360DialogExtendedCampaignMessage?: WhatsApp360DialogExtendedCampaignMessageType;
  officialTemplateParams?: string[];
  isSelectedTemplate?: boolean;
  facebookOTN?: FacebookOTNStateType;
  extendedMessageType?: ExtendedMessageType.WhatsappTwilioContentTemplateMessage;
  extendedMessagePayloadDetail?: WhatsappTwilioContentMessageType;
  whatsappCloudApiTemplateMessageObject?: WhatsappCloudApiTemplateMessageObjectType;
};

export interface MultiUploadStateType<
  TFile extends UploadedFileGeneralProxyType
> {
  uploadedFiles: TFile[];
}

export interface SendWhatsappTemplateState extends GenericSendWhatsappTemplate {
  templateContent?: OptInContentType;
}

export type UpdateSelectedCampaignMessageType =
  | string
  | SendWhatsappTemplateState
  | UploadedBroadcastFileType[]
  | string[]
  | Partial<FacebookOTNStateType>;

type WhatsappCloudApiTemplateMessageObjectType = {
  templateName: string;
  language: string;
  components: (
    | TemplateMessageComponentType
    | Whatsapp360DialogTemplateMessageComponentFooterType
  )[];
};
interface ExtendedMessagePayloadDetailType
  extends WhatsappTwilioContentMessageType {
  whatsappCloudApiTemplateMessageObject: WhatsappCloudApiTemplateMessageObjectType;
}
export type BroadcastCampaignChannelMessageType = {
  id?: number;
  targetedChannels: TargetedChannelType[];
  templateContent: string;
  templateParams: string[];
  uploadedFiles: UploadedBroadcastFileType[];
  templateName?: string;
  whatsApp360DialogExtendedCampaignMessage?: WhatsApp360DialogExtendedCampaignMessageType;
  officialTemplateParams?: string[];
  messageTag?: string;
  facebookOTNTopicId?: string;
  ExtendedMessageType?: ExtendedMessageType.WhatsappCloudApiTemplateMessage;
  extendedMessagePayloadDetail?: ExtendedMessagePayloadDetailType;
};

export type FilterConditionCommonType = {
  conditionOperator: ConditionNameType | string;
  fieldName?: string;
  nextOperator?: LogicType;
  values?: string[];
  containHashTag?: never;
  timeValueType?: "Seconds" | "Minutes" | "Hours" | "Days";
};

export type FilterHashtagConditionType = {
  containHashTag: string;
  conditionOperator?: ConditionNameType | string;
  nextOperator: LogicType;
  fieldName?: never;
  values?: string[];
};

export type AudienceFilterConditionType =
  | FilterConditionCommonType
  | FilterHashtagConditionType
  | FilterCampaignTemplateType;

export const BroadcastStatusMap = {
  sent: 0,
  delivered: 1,
  read: 2,
  replied: 3,
  failed: 4,
  //todo sync with backend?
  scheduled: -1,
  draft: -1,
  sending: -1,
  paused: -1,
} as const;

export type BroadcastStatusAliasType = keyof typeof BroadcastStatusMap;

export type BroadcastStatusType =
  typeof BroadcastStatusMap[BroadcastStatusAliasType];

export type FilterCampaignTemplateType = {
  companyMessageTemplateId: string;
  broadcastMessageStatus: BroadcastStatusType;
};

export function isFilterCommon(
  filter: any
): filter is FilterConditionCommonType {
  return "conditionOperator" in filter && !("containHashTag" in filter);
}

export function isFilterHashtag(
  filter: any
): filter is FilterHashtagConditionType {
  return "containHashTag" in filter;
}

export interface TargetedChannelType {
  channel: ChannelType;
  ids?: string[];
}

export interface TargetedChannelWithIdType {
  channel: ChannelType;
  ids: [string];
}

export const FIELD_TYPE_HASHTAG = "hashtag";
export const FIELD_TYPE_CAMPAIGN = "campaign";
