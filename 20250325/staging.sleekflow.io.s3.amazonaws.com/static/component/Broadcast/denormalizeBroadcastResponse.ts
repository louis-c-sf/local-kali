import BroadcastCampaignType, {
  AudienceType,
  BroadcastCampaignRealTimeStatisticsType,
} from "../../types/BroadcastCampaignType";
import { splitDefaultChannel } from "../Channel/selectors";
import { ChannelConfiguredType } from "../Chat/Messenger/types";
import { BroadcastResponseType } from "../../api/Broadcast/fetchBroadcastCampaign";
import { denormalizeCampaignChannelMessages } from "./BroadcastContent/denormalizeCampaignChannelMessages";
import { fromApiCondition } from "../../api/Contacts/fromApiCondition";

export function denormalizeBroadcastResponse(
  response: BroadcastResponseType,
  channels: ChannelConfiguredType<any>[],
  statisticsData?: BroadcastCampaignRealTimeStatisticsType
): BroadcastCampaignType {
  const {
    id,
    templateName,
    templateContent,
    conditions,
    targetedChannelWithIds,
    templateParams,
    updatedAt,
    status,
    uploadedFiles,
    savedBy,
  } = response;
  let content = templateContent;
  for (const i in templateParams) {
    content = content.replace(`{${i}}`, templateParams[i]);
  }
  const audienceTypes: AudienceType[] = conditions.map(fromApiCondition);

  const { sent, read, replied, delivered } = statisticsData ?? {
    sent: 0,
    read: 0,
    replied: 0,
    delivered: 0,
  };
  const channelWithId = {
    channel: targetedChannelWithIds[0]?.channel || "",
    ids: targetedChannelWithIds[0]?.ids && [targetedChannelWithIds[0]?.ids[0]],
  };
  return {
    id,
    status: status.charAt(0).toUpperCase() + status.substring(1),
    name: templateName,
    channels: response.targetedChannels,
    channelsWithIds: targetedChannelWithIds,
    channelWithId: channelWithId,
    otherChannelsWithIds: targetedChannelWithIds.reduce(
      splitDefaultChannel(channelWithId),
      []
    ),
    sent: sent,
    read: read,
    reply: replied,
    delivered: delivered,
    readRate: formatStatisticData(status, delivered, read),
    replyRate: formatStatisticData(status, delivered, replied),
    deliveredRate: formatStatisticData(status, sent, delivered),
    audienceTypes,
    params: templateParams,
    uploadedFiles,
    scheduledAt: response.scheduledAt,
    broadcastHistoryCount: response.broadcastHistoryCount,
    lastUpdated: updatedAt,
    startDate: response.sentAt,
    content: "",
    createdBy: savedBy ?? undefined,
    selectedAll: false,
    totalChannels: 0,
    isBroadcastOn: response.isBroadcastOn,
    templateSelection: false,
    stripePaymentRequestOption:
      response.stripePaymentRequestOption || undefined,
    campaignChannelMessages: denormalizeCampaignChannelMessages(
      channels,
      response
    ),
  };
}

function formatStatisticData(
  status: string,
  baseNumber: number,
  currentData: number
) {
  if (status.toLowerCase() === "draft") {
    return "";
  }
  if (baseNumber > 0) {
    return currentData > 0
      ? `(${((currentData / baseNumber) * 100).toFixed(2)}%)`
      : "";
  }
  return "";
}
