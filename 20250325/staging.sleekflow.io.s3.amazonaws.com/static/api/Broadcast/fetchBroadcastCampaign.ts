import { get } from "../apiRequest";
import { GET_BROADCAST_BY_ID } from "../apiPath";
import { StaffType } from "types/StaffType";
import { UploadedBroadcastFileType } from "types/UploadedFileType";
import {
  TargetedChannelType,
  AudienceFilterConditionType,
  BroadcastCampaignStatisticsType,
  BroadcastCampaignChannelMessageType,
} from "types/BroadcastCampaignType";
import { Whatsapp360DialogTemplateMessageType } from "types/MessageType";
import { AutomationActionType } from "types/AutomationActionType";
import { PaymentLinkSetType } from "core/models/Ecommerce/Payment/PaymentLinkType";

export interface BroadcastResponseType {
  id: string;
  companyId: string;
  status: string;
  targetedChannels: string[];
  targetedChannelWithIds: TargetedChannelType[];
  conditions: AudienceFilterConditionType[];
  templateName: string;
  templateContent: string;
  templateParams: string[];
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
  broadcastHistoryCount?: number;
  sentAt?: string;
  savedBy?: StaffType;
  uploadedFiles: UploadedBroadcastFileType[];
  statisticsData?: BroadcastCampaignStatisticsType;
  isBroadcastOn: boolean;
  campaignChannelMessages: BroadcastCampaignChannelMessageType[];
  whatsApp360DialogExtendedCampaignMessage?: WhatsApp360DialogExtendedCampaignMessageType;
  campaignAutomationActions?: AutomationActionType[];
  stripePaymentRequestOption?: PaymentLinkSetType;
}
export interface WhatsApp360DialogExtendedCampaignMessageType {
  messageType: string;
  whatsapp360DialogTemplateMessage: Whatsapp360DialogTemplateMessageType;
}
export async function fetchBroadcastCampaign(
  id: string
): Promise<BroadcastResponseType> {
  return await get(GET_BROADCAST_BY_ID.replace("{id}", id), { param: {} });
}
