import { BroadcastCampaignChannelMessageType } from "../../../types/BroadcastCampaignType";
import { transformToEditableContent } from "./transformToEditableContent";

export function formatDenormalizedCampaignChannelMessage(
  campaignMessage: BroadcastCampaignChannelMessageType
) {
  const content = transformToEditableContent(
    campaignMessage.templateContent ?? "",
    campaignMessage.templateParams
  );
  return {
    id: campaignMessage.id,
    content: content,
    uploadedFiles: campaignMessage.uploadedFiles,
    params: campaignMessage.templateParams,
  };
}
