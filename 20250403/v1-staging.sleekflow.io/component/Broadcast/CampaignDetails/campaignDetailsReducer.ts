import produce from "immer";
import ProfileSearchType from "../../../types/ProfileSearchType";
import { BroadcastResponseType } from "../../../api/Broadcast/fetchBroadcastCampaign";
import { BroadcastStatusAliasType } from "../../../types/BroadcastCampaignType";
import { BroadcastUserStatusResponseType } from "../../../api/Broadcast/fetchBroadcastUsersStatus";

export type CampaignDetailsStateType = {
  pending: boolean;
  booted: boolean;
  campaign?: BroadcastResponseType;
  statusSelected: BroadcastStatusAliasType;
  statusCount: Record<string, number>;
  contacts: ProfileSearchType[];
  contactsPending: boolean;
  isPreviewVisible: boolean;
  page: number;
  showAddToList: boolean;
  contactStatusDetails: BroadcastUserStatusResponseType[];
};

export type CampaignDetailsActionType =
  | {
      type: "BOOTED";
      campaign: BroadcastResponseType;
      totals: Record<string, number>;
    }
  | {
      type: "PAGE_LOADED";
      contacts: ProfileSearchType[];
      total: number;
      status: string;
      contactStatusDetails: BroadcastUserStatusResponseType[];
    }
  | {
      type: "PAGE_LOAD_START";
      status: BroadcastStatusAliasType;
    }
  | {
      type: "STATUS_SELECTED";
      status: BroadcastStatusAliasType;
    }
  | {
      type: "PAGE_CHANGED";
      number: number;
    }
  | {
      type: "PAGE_LOAD_CANCEL";
    }
  | {
      type: "ADD_TO_LIST_CLICK";
    }
  | {
      type: "ADD_TO_LIST_COMPLETE";
    }
  | {
      type: "ADD_TO_LIST_CANCEL";
    }
  | {
      type: "PREVIEW_TOGGLE";
    };

const mainReducer = produce(
  (draft: CampaignDetailsStateType, action: CampaignDetailsActionType) => {
    switch (action.type) {
      case "BOOTED":
        draft.campaign = action.campaign;
        draft.booted = true;
        draft.statusCount = { ...draft.statusCount, ...action.totals };
        draft.page = 1;
        return;

      case "PAGE_CHANGED":
        draft.page = action.number;
        break;

      case "STATUS_SELECTED":
        draft.statusSelected = action.status;
        draft.page = 1;
        break;

      case "PAGE_LOAD_START":
        draft.contactsPending = true;
        draft.statusSelected = action.status;
        return;

      case "PAGE_LOAD_CANCEL":
        draft.contactsPending = false;
        return;

      case "PAGE_LOADED":
        draft.contacts = action.contacts;
        draft.statusCount[action.status] = action.total;
        draft.contactStatusDetails = action.contactStatusDetails;
        return;

      case "PREVIEW_TOGGLE":
        draft.isPreviewVisible = !draft.isPreviewVisible;
        return;
    }
  }
);

export const campaignDetailsReducer = mainReducer;

export function campaignDetailsDefaultState(): CampaignDetailsStateType {
  return {
    booted: false,
    showAddToList: false,
    campaign: undefined,
    page: 1,
    contacts: [],
    contactsPending: false,
    pending: false,
    isPreviewVisible: false,
    statusCount: {
      sent: 0,
      delivered: 0,
      read: 0,
      replied: 0,
    },
    statusSelected: "sent",
    contactStatusDetails: [],
  };
}
