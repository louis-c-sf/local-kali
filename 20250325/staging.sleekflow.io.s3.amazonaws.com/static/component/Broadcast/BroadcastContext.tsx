import React, { createContext } from "react";
import BroadcastCampaignType, {
  MultiUploadStateType,
  TargetedChannelType,
  AudienceType,
  ChannelMessageType,
  UpdateSelectedCampaignMessageType,
} from "../../types/BroadcastCampaignType";
import { DropdownSelectionOptionType } from "../Chat/ChannelFilterDropdown";
import { UploadedBroadcastFileType } from "types/UploadedFileType";
import { defaultStaff } from "types/StaffType";
import { ChannelConfiguredType, ChannelType } from "../Chat/Messenger/types";
import { AutomationActionType } from "types/AutomationActionType";
import { WhatsappTemplateNormalizedType } from "types/WhatsappTemplateResponseType";
import {
  TemplateVariableState,
  Whatsapp360DialogFileUploadType,
} from "App/reducers/Chat/whatsappTemplatesReducer";
import { MultiUploadActionType } from "../Form/MultiUploadInput/multiUploadReducer";
import { SendMessageResponseType } from "./BroadcastContent/BroadcastContent";
import { PaymentLinkSetType } from "core/models/Ecommerce/Payment/PaymentLinkType";
import { OptInContentType } from "features/Whatsapp360/models/OptInType";
import { FacebookOTNStateType } from "features/Facebook/models/FacebookOTNTypes";

export type BroadcastCampaignActionType =
  | {
      type: "UPDATE_TOTAL_CHANNELS";
      numOfChannels: number;
    }
  | {
      type: "UPDATE_OTHER_CHANNELS";
      otherChannelsWithIds: TargetedChannelType[];
    }
  | { type: "UPDATE_DATE"; startDate: string }
  | { type: "UPDATE_SCHEDULE"; scheduledAt?: string }
  | { type: "UPDATE_FILTER"; audienceTypes?: AudienceType[] }
  | { type: "UPDATE_CONTACT_LISTS_DATA"; contactLists: number[] }
  | {
      type: "UPDATE_CONTENT";
      content?: string;
      campaignIndex: number;
      updatedCampaignMessage: ChannelMessageType;
    }
  | {
      type: "UPDATE_FACEBOOK_OTN";
      campaignIndex: number;
      prevMessages: ChannelMessageType;
      prevFacebookOTN: FacebookOTNStateType | undefined;
      currentValue: Partial<FacebookOTNStateType>;
    }
  | { type: "UPDATE_TITLE"; name: string }
  | { type: "CONNECT_TEXTAREA"; textarea: HTMLTextAreaElement }
  | { type: "CONTENT_LOADED"; isNewBroadCast: boolean }
  | { type: "VALIDATION_COMPLETE"; errors?: { [field: string]: string } }
  | { type: "UPDATE_BROADCAST_ID"; id: string }
  | { type: "UPDATE_CHANNELS"; channelsWithIds: TargetedChannelType[] }
  | { type: "UPDATE_CONTACT_LISTS"; contactLists: number[] }
  | { type: "CONNECT_FILES_INPUT"; addAttachment: () => void }
  | { type: "UPDATE_SELECT_ALL_CHANNELS"; selectedAll: boolean }
  | {
      type: "UPDATE_ALL";
      campaignChannelMessages: ChannelMessageType[];
      lastUpdated: string;
      scheduledAt?: string;
      status: string;
      content: string;
      params: string[];
      id: string;
      name: string;
      fileList: UploadedBroadcastFileType[];
      contactLists: number[];
      channelsWithIds: TargetedChannelType[];
      audienceTypes: AudienceType[];
      companyChannels: ChannelConfiguredType<any>[];
      automationActions: AutomationActionType[];
      stripePaymentRequestOption?: PaymentLinkSetType;
    }
  | { type: "UPDATE_PAYMENT_LINK"; link: PaymentLinkSetType }
  | { type: "CLEAR_PAYMENT_LINK" }
  | {
      type: "CHANGE_EDIT_MODE";
      mode: string;
      selectedIndex: number;
    }
  | {
      type: "TOGGLE_NOTE_MODAL";
      isNoteModalOpen: boolean;
    }
  | {
      type: "TOGGLE_PREVIEW_MODAL";
      show: boolean;
    }
  | {
      type: "SELECTED_CHANNEL";
      channel: ChannelType;
    }
  | {
      type: "INIT_CHANNELS_SELECTED";
      channels: TargetedChannelType[];
      isSelectAll: boolean;
    }
  | { type: "SEND_COMPLETE"; result: SendMessageResponseType }
  | MultiUploadActionType<UploadedBroadcastFileType>
  | WhatsAppTemplateActionType
  | CampaignAutomationsActionType;

export type WhatsAppTemplateActionType =
  | { type: "SET_TEMPLATE_SELECTION" }
  | { type: "CANCEL_TEMPLATE_SELECTION" }
  | { type: "CLEAR_TEMPLATE_SELECTION" }
  | {
      type: "SELECTED_TEMPLATE_SELECTION";
      template: WhatsappTemplateNormalizedType | OptInContentType;
      language: string;
      channelType: ChannelType;
      templateName: string;
      variables?: TemplateVariableState;
      file?: Whatsapp360DialogFileUploadType;
      currentId: number;
    }
  | {
      type: "UPDATE_OFFICIAL_TEMPLATE_PARAM";
      params: string[];
    };

export type CampaignAutomationsActionType = {
  type: "AUTOMATIONS_UPDATE";
  actions: AutomationActionType[];
};

export interface BroadcastCampaignContextType
  extends MultiUploadStateType<UploadedBroadcastFileType>,
    BroadcastCampaignType {
  broadcastDispatch: (action: BroadcastCampaignActionType) => void;
  textarea: HTMLTextAreaElement | undefined;
  channelDropdownOptions: DropdownSelectionOptionType[];
  contentLoaded: boolean;
  isReviewModalVisible: boolean;
  formErrors: {
    [field: string]: string;
  };
  createMode: {
    initChannelsPopup: {
      isSelected: boolean;
      isVisible: boolean;
    };
  };
  rules: {
    canUseMultipleChannels: boolean;
  };
}

export interface UpdateContentInterface {
  (
    type: keyof ChannelMessageType,
    content: UpdateSelectedCampaignMessageType
  ): void;
}

export const defaultBroadcastCampaign: BroadcastCampaignType = {
  id: "",
  status: "",
  name: "",
  createdBy: {
    ...defaultStaff,
  },
  channels: [],
  channelsWithIds: [],
  lastUpdated: "",
  content: "",
  startDate: "",
  time: "",
  params: [],
  audienceTypes: [
    {
      fieldName: "",
      fieldType: "",
      filterValue: [""],
      filterCondition: "",
    },
  ],
  contactLists: [],
  uploadedFiles: [],
  selectedAll: false,
  totalChannels: 0,
  isBroadcastOn: false,
  companyChannels: [],
  templateSelection: false,
  campaignChannelMessages: [],
  stripePaymentRequestOption: undefined,
};

export function broadcastContextDefaults(): BroadcastCampaignContextType {
  return {
    ...defaultBroadcastCampaign,
    textarea: undefined,
    contentLoaded: false,
    channelDropdownOptions: [],
    formErrors: {},
    uploadedFiles: [],
    isReviewModalVisible: false,
    createMode: {
      initChannelsPopup: {
        isSelected: false,
        isVisible: false,
      },
    },
    rules: { canUseMultipleChannels: false },
    automationActions: [],
    broadcastDispatch: () => {},
  };
}

const BroadcastContext = createContext<BroadcastCampaignContextType>(
  broadcastContextDefaults()
);

export default BroadcastContext;
