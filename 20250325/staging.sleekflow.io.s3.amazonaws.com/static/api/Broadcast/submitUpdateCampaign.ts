import {
  AudienceFilterConditionType,
  BroadcastCampaignChannelMessageType,
  TargetedChannelType,
} from "types/BroadcastCampaignType";
import { postWithExceptions } from "../apiRequest";
import { POST_BROADCAST_WITH_TEMPLATE_ID } from "../apiPath";
import { AutomationActionType } from "types/AutomationActionType";
import { PaymentLinkSetType } from "core/models/Ecommerce/Payment/PaymentLinkType";

export interface BroadcastRequestType {
  templateName: string;
  templateParams?: string[];
  conditions?: AudienceFilterConditionType[];
  scheduledAt?: string;
  campaignChannelMessages: BroadcastCampaignChannelMessageType[];
  targetedChannels?: string[];
  targetedChannelWithIds: TargetedChannelType[];
  broadcastAsNote?: boolean;
  automationActions?: AutomationActionType[];
  stripePaymentRequestOption?: PaymentLinkSetType;
}

export async function submitUpdateCampaign(
  id: string,
  param: BroadcastRequestType
) {
  return await postWithExceptions(
    POST_BROADCAST_WITH_TEMPLATE_ID.replace("{id}", id),
    { param }
  );
}
