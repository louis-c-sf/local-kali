export default function getIsReadOnlyCampaign(status: string | undefined) {
  return status
    ? !["draft", "scheduled"].includes(status.toLowerCase())
    : false;
}
