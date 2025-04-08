import { getWithExceptions } from "../../apiRequest";
import { BlastCampaignType } from "./BlastCampaignType";

export async function fetchBlastCampaign(
  id: string
): Promise<BlastCampaignType> {
  return await getWithExceptions("/blast-message/{id}".replace("{id}", id), {
    param: {},
  });
}
