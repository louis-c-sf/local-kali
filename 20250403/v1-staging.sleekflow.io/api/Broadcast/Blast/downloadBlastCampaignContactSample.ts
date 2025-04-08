import { downloadFileViaGet } from "../../apiRequest";

export async function downloadBlastCampaignContactSample() {
  return await downloadFileViaGet(
    "/blast-message/contact/sample",
    "sample.csv",
    "text/csv"
  );
}
