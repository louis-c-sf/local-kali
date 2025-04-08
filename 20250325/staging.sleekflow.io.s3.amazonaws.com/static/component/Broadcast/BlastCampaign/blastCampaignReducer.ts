import { FormikErrors } from "formik";
import produce from "immer";
import React, { Reducer } from "react";
import {
  BlastCampaignBaseType,
  BlastCampaignType,
} from "../../../api/Broadcast/Blast/BlastCampaignType";

export type BlastCampaignStateType = {
  templateSelectVisible: boolean;
  fileUploading: boolean;
  mutating: boolean;
  testing: boolean;
  confirming: boolean;
  sendAttempted: boolean;
  campaignStatus: BlastCampaignType["status"] | null;
};
export type BlastCampaignActionType =
  | { type: "BOOTED"; status: BlastCampaignType["status"] }
  | { type: "TEMPLATE_SELECTION_SHOW" }
  | { type: "TEMPLATE_SELECTION_HIDE" }
  | { type: "SEND_STARTED" }
  | { type: "SEND_COMPLETED" }
  | { type: "SUBMIT_REQUESTED" }
  | { type: "SUBMIT_CONFIRMED" }
  | { type: "SUBMIT_CANCELED" }
  | { type: "UPLOAD_STARTED" }
  | { type: "UPLOAD_COMPLETED" };

type BlastCampaignContextType = BlastCampaignStateType & {
  dispatch: React.Dispatch<BlastCampaignActionType>;
};

export const BlastCampaignContext =
  React.createContext<BlastCampaignContextType>({
    ...initialState(null),
    dispatch: () => !1,
  });

export function initialState(
  status: BlastCampaignType["status"] | null
): BlastCampaignStateType {
  return {
    templateSelectVisible: false,
    fileUploading: false,
    mutating: false,
    testing: false,
    sendAttempted: false,
    confirming: false,
    campaignStatus: status,
  };
}

export const blastCampaignReducer = produce(
  (draft: BlastCampaignStateType, action: BlastCampaignActionType) => {
    switch (action.type) {
      case "BOOTED":
        draft.campaignStatus = action.status;
        break;

      case "TEMPLATE_SELECTION_SHOW":
        draft.templateSelectVisible = true;
        break;

      case "TEMPLATE_SELECTION_HIDE":
        draft.templateSelectVisible = false;
        break;

      case "SEND_COMPLETED":
        draft.mutating = false;
        break;

      case "SEND_STARTED":
        draft.mutating = true;
        break;

      case "UPLOAD_STARTED":
        draft.fileUploading = true;
        break;

      case "UPLOAD_COMPLETED":
        draft.fileUploading = false;
        break;

      case "SUBMIT_REQUESTED":
        draft.confirming = true;
        break;

      case "SUBMIT_CONFIRMED":
        draft.confirming = false;
        break;

      case "SUBMIT_CANCELED":
        draft.confirming = false;
        break;
    }
  }
) as Reducer<BlastCampaignStateType, BlastCampaignActionType>;
