import { downloadFileViaGet } from "../../apiRequest";

export async function downloadBlastCampaignResults(id: string) {
  return await downloadFileViaGet(
    `/blast-message/contact/${id}`,
    `campaign-results-${id}`,
    "text/csv"
  );
}
