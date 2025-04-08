import { getWithExceptions } from "../../apiRequest";
import { TargetedChannelType } from "../../../types/BroadcastCampaignType";
import { StaffType } from "../../../types/StaffType";
import { BlastCampaignType } from "./BlastCampaignType";

export async function fetchBlastCampaignList(
  limit: number,
  offset: number
): Promise<BlastCampaignsResponseType> {
  return await getWithExceptions("/blast-message/list", {
    param: { limit, offset },
  });
}

type BlastCampaignsResponseType = {
  blastMessageTemplates: BlastCampaignType[];
  total: number;
};
