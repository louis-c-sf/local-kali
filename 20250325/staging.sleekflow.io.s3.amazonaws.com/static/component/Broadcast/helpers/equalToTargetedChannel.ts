import { TargetedChannelType } from "../../../types/BroadcastCampaignType";
import { eqBy, pick } from "ramda";

export const equalToTargetedChannel =
  (original: TargetedChannelType) => (chnl: TargetedChannelType) =>
    eqBy(pick(["channel", "ids"]), chnl, original);
