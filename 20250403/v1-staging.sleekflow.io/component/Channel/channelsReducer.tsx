import React from "react";
import ChannelInfoType, {
  ChannelInfoConfiguredType,
} from "../../types/ChannelInfoType";
import { setAutoFreeze } from "immer";
import CompanyType from "../../types/CompanyType";
import { PlanDisplayType } from "../../types/PlanSelectionType";
import { ChannelType } from "../Chat/Messenger/types";

setAutoFreeze(false);
export interface ChannelsState {
  channelClicked: ChannelInfoType | undefined;
  channelOpened: ChannelType | undefined;
  channelsActive: ChannelInfoConfiguredType<any>[];
  channelsAvailable: ChannelInfoType[];
  channelsIntegration: ChannelInfoType[];
  channelsAutomatedIntegration: ChannelInfoType[];
  channelsPending: boolean;
  channelsRequested: ChannelInfoType[];
  isWhatsappConnected: boolean;
  isWhatsappPaid: boolean;
  liveChatStatusPending: boolean;
  pending: boolean;
  confirmModalPending: boolean;
  showChannelForm: boolean;
  showRenameConfirmModal: boolean;
  showRemoveConfirmModal: boolean;
  showSwichShopifyOwnerConfirmModal: boolean;
  subscriptionPlanCurrent: PlanDisplayType | undefined;
  subscriptionPlansAvailable: PlanDisplayType[] | undefined;
  isWhatsappScanned?: boolean;
  isWhatsappChannelSelected: boolean;
  isReviewPlanModalOpen: boolean;
  isNewVersionModalOpen: boolean;
  selectedChannelName: string;
}

export type ChannelsAction =
  | { type: "CHANNEL_ACTIVATED"; channel: ChannelInfoConfiguredType<any> }
  | { type: "CHANNELS_LOAD" }
  | { type: "CHANNEL_WHATSAPP_FORM_CLOSE" }
  | { type: "CHANNEL_FORM_OPEN"; channelName: ChannelType; allowBack?: boolean }
  | {
      type: "CHANNEL_WHATSAPP_FORM_OPEN";
      channelName: ChannelType;
    }
  | { type: "CHANNEL_FORM_CLOSE" }
  | {
      type: "CHANNELS_UPDATE";
      channelsActive: ChannelInfoConfiguredType<any>[];
      channelsAvailable: ChannelInfoType[];
      channelsRequested: ChannelInfoType[];
      channelsIntegration: ChannelInfoType[];
      channelAutomatedIntegration: ChannelInfoType[];
    }
  | { type: "COMPANY_LOADED"; company: CompanyType; plans: PlanDisplayType[] }
  | { type: "LIVECHAT_STATUS_LOAD" }
  | { type: "LIVECHAT_STATUS_UPDATE"; status: boolean }
  | { type: "PLANS_LOADED"; plans: PlanDisplayType[]; company: CompanyType }
  | {
      type: "REMOVE_CONFIRM";
      channel: ChannelInfoType;
    }
  | {
      type: "SWITCH_SHOPIFY_OWNER_CONFIRM";
      channel: ChannelInfoType;
    }
  | {
      type: "RENAME_CONFIRM";
      channel: ChannelInfoType;
    }
  | { type: "RENAME_COMPLETE" }
  | { type: "EXECUTE_START" }
  | { type: "EXECUTE_CANCEL" }
  | { type: "REMOVE_COMPLETE" }
  | { type: "WHATSAPP_SCANNED" }
  | { type: "STRIPE_STATUS_UPDATE"; status: boolean }
  | { type: "SALESFORCE_STATUS_UPDATE" }
  | { type: "HUBSPOT_STATUS_UPDATE" }
  | { type: "REVIEW_PLAN_MODAL_OPEN" }
  | { type: "REVIEW_PLAN_MODAL_CLOSE" }
  | { type: "NEW_VERSION_MODAL_OPEN"; channelName: string }
  | { type: "NEW_VERSION_MODAL_CLOSE" };

export function defaultChannelsState(): ChannelsState {
  return {
    channelOpened: undefined,
    channelClicked: undefined,
    channelsActive: [],
    channelsAvailable: [],
    channelsIntegration: [],
    channelsAutomatedIntegration: [],
    channelsPending: true,
    channelsRequested: [],
    isWhatsappConnected: false,
    isWhatsappPaid: false,
    liveChatStatusPending: true,
    pending: true,
    showChannelForm: false,
    showRenameConfirmModal: false,
    showRemoveConfirmModal: false,
    confirmModalPending: false,
    subscriptionPlanCurrent: undefined,
    subscriptionPlansAvailable: undefined,
    isWhatsappChannelSelected: false,
    showSwichShopifyOwnerConfirmModal: false,
    isReviewPlanModalOpen: false,
    isNewVersionModalOpen: false,
    selectedChannelName: "",
  };
}
