import { createContext } from "react";
import {
  CampaignDetailsStateType,
  campaignDetailsDefaultState,
} from "./campaignDetailsReducer";

export const CampaignDetailsContext = createContext<CampaignDetailsStateType>(
  campaignDetailsDefaultState()
);
