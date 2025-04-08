import { BlastCampaignStateType } from "../../../component/Broadcast/BlastCampaign/blastCampaignReducer";

export function useBlastCampaignPolicies() {
  const isFormEditable = (state: BlastCampaignStateType) => {
    return state.mutating || state.testing || isCampaignFrozen(state);
  };

  const isCampaignFrozen = (state: BlastCampaignStateType) => {
    return ["Processing", "Sent", "Queued", "Error"].includes(
      state.campaignStatus ?? ""
    );
  };

  return {
    isFormEditable,
    isCampaignFrozen,
  };
}
