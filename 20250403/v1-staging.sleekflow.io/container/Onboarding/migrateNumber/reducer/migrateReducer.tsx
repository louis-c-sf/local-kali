import {
  BusinessVerificationStatusDict,
  BusinessVerificationStatusDictEnum,
  UnConnectedChannelType,
  WebaDtoPhoneNumberType,
} from "component/CreateWhatsappFlow/types";
import produce from "immer";
import { Reducer } from "react";
import { reduceReducers } from "utility/reduce-reducers";
import { MigrateNumberContextType } from "../MigrateNumberContext";
import {
  ConnectedWhatsappCloudApiConfigType,
  SceneTypeDict,
  SceneTypeDictEnum,
  StepsDict,
} from "../types";

export const migrateNumberReducer: Reducer<
  MigrateNumberContextType,
  MigrateNumberActionType
> = produce(
  (draft: MigrateNumberContextType, action: MigrateNumberActionType) => {
    switch (action.type) {
      case "UPDATE_FACEBOOK_ACCESS_TOKEN":
        draft.facebookAccessToken = action.token;
        break;
      case "UPDATE_CHANNEL_NAME":
        draft.channelName = action.channelName;
        break;
      case "PREV_STEP":
        if (draft.currentStep > 1) {
          draft.currentStep -= 1;
        }
        break;
      case "NEXT_STEP":
        if (draft.currentStep < draft.stepsTotal) {
          draft.currentStep += 1;
        }
        break;
      case "SET_IS_TURN_OFF_PIN":
        draft.isCompleted = action.isCompleted;
        break;
      case "IS_SLEEKFLOW_NUMBER_EXIST":
        draft.isSleekFlowNumberExist = action.isSleekFlowNumberExist;
        break;
      case "SET_SCENE":
        draft.scene = action.scene;
        break;
      case "SET_BUSINESS_INFO":
        draft.businessId = action.businessId;
        draft.businessName = action.businessNmae;
        break;
      case "SET_PHONE_NUMBER":
        draft.facebookPhoneNumber = action.facebookPhoneNumber;
        break;
      case "SET_IS_ON_PREMISES":
        draft.isOnPremises = action.isOnPremises;
        break;
      case "SET_FACEBOOK_WABAID":
        draft.facebookWabaId = action.facebookWabaId;
        draft.messagingHubWabaId = action.messagingHubWabaId;
        break;
      case "SET_DESTINATION_PHONE_NUMBER_ID":
        draft.destinationPhoneNumberId = action.destinationPhoneNumberId;
        break;
      case "SET_VERIFIED_CODE":
        draft.verifiedCode = action.verifiedCode;
        break;
      case "SET_REVIEW_DATA":
        draft.reviewData.facebookWabaName = action.businessAccount;
        draft.reviewData.whatsappPhoneNumber = action.whatsappPhoneNumber;
        draft.reviewData.whatsappDisplayName = action.whatsappDisplayName;
        draft.reviewData.channelName = action.channelName;
        draft.reviewData.facebookWabaBusinessName = action.facebookBusinessName;
        draft.reviewData.facebookWabaBusinessVerificationStatus =
          action.businessVerificationStatus as BusinessVerificationStatusDictEnum;
        draft.reviewData.facebookPhoneNumberNameStatus = action.approvalStatus;
        draft.reviewData.facebookPhoneNumberMessagingLimitTier =
          action.messagingLimitTier;
        draft.reviewData.facebookWabaBusinessId = action.facebookWabaBusinessId;
        break;
      case "SET_CLICKED_NEXT_BUTTON":
        draft.isClicked = action.isClicked;
        break;
      case "RESET_STEP":
        if (action.step === StepsDict.dropdowns) {
          draft.businessId = "";
          draft.facebookPhoneNumber = "";
          draft.facebookWabaId = "";
          draft.destinationPhoneNumberId = "";
          draft.isOnPremises = false;
        }
        break;
      case "SET_LOADING":
        draft.loading = action.loading;
        break;
      case "SET_IS_VERIFY_CODE_FAIL":
        draft.isVerifyFail = action.isVerifyFail;
        break;
      case "SET_DESTINATION_ID_AND_GO_NEXT":
        draft.destinationPhoneNumberId = action.destinationPhoneNumberId;
        draft.isClicked = false;
        draft.currentStep += 1;
        break;
      case "SET_VERIFY_FAIL":
        draft.isClicked = false;
        draft.isVerifyFail = true;
        break;
      case "ADD_UNCONNECTED_BUSINESS":
        draft.unconnectedBusiness = action.unconnectedBusiness;
        break;
      case "SET_DESTINATION_MESSAGING_HUB_INFO":
        draft.destinationMessagingHubPhoneNumberId =
          action.destinationMessagingHubPhoneNumberId;
        draft.destinationMessagingHubWabaId =
          action.destinationMessagingHubWabaId;
        break;
    }
  }
);

export type MigrateNumberActionType =
  | {
      type: "UPDATE_FACEBOOK_ACCESS_TOKEN";
      token: string;
    }
  | {
      type: "UPDATE_CHANNEL_NAME";
      channelName: string;
    }
  | {
      type: "PREV_STEP";
    }
  | {
      type: "NEXT_STEP";
    }
  | {
      type: "SET_IS_TURN_OFF_PIN";
      isCompleted: boolean;
    }
  | {
      type: "SET_SCENE";
      scene: SceneTypeDictEnum;
    }
  | {
      type: "SET_BUSINESS_INFO";
      businessId: string;
      businessNmae: string;
    }
  | {
      type: "SET_PHONE_NUMBER";
      facebookPhoneNumber: string;
    }
  | {
      type: "SET_IS_ON_PREMISES";
      isOnPremises: boolean;
    }
  | {
      type: "SET_FACEBOOK_WABAID";
      facebookWabaId: string;
      messagingHubWabaId: string;
    }
  | {
      type: "SET_DESTINATION_PHONE_NUMBER_ID";
      destinationPhoneNumberId: string;
    }
  | {
      type: "SET_VERIFIED_CODE";
      verifiedCode: string[];
    }
  | {
      type: "SET_CLICKED_NEXT_BUTTON";
      isClicked: boolean;
    }
  | {
      type: "RESET_STEP";
      step: number;
    }
  | {
      type: "SET_LOADING";
      loading: boolean;
    }
  | {
      type: "SET_REVIEW_DATA";
      businessAccount: string;
      whatsappPhoneNumber: string;
      whatsappDisplayName: string;
      channelName: string;
      facebookBusinessName: string;
      businessVerificationStatus: string;
      approvalStatus: string;
      messagingLimitTier: string;
      facebookWabaBusinessId: string;
    }
  | {
      type: "SET_IS_VERIFY_CODE_FAIL";
      isVerifyFail: boolean;
    }
  | {
      type: "IS_SLEEKFLOW_NUMBER_EXIST";
      isSleekFlowNumberExist: boolean;
    }
  | {
      type: "ADD_UNCONNECTED_BUSINESS";
      unconnectedBusiness: Array<UnConnectedChannelType>;
    }
  | {
      type: "SET_DESTINATION_MESSAGING_HUB_INFO";
      destinationMessagingHubPhoneNumberId: string;
      destinationMessagingHubWabaId: string;
    }
  | {
      type: "SET_DESTINATION_ID_AND_GO_NEXT";
      destinationPhoneNumberId: string;
    }
  | {
      type: "SET_VERIFY_FAIL";
    };

export type MigrateNumberType = {
  currentStep: number;
  stepsTotal: number;
  facebookAccessToken: string;
  businessId: string;
  businessName: string;
  facebookPhoneNumber: string;
  isOnPremises: boolean;
  facebookWabaId: string; //Sleekflow waba id
  destinationPhoneNumberId: string;
  channelName: string;
  isCompleted: boolean;
  verifiedCode: string[];
  isClicked: boolean;
  scene: SceneTypeDictEnum;
  isSleekFlowNumberExist: boolean;
  messagingHubWabaId: string;
  destinationMessagingHubWabaId: string;
  destinationMessagingHubPhoneNumberId: string;
  unconnectedBusiness: Array<UnConnectedChannelType> | undefined;
  loading: boolean;
  reviewData: ConnectedWhatsappCloudApiConfigType;
  isVerifyFail: boolean;
};

export const migrateNumberDefaultState: MigrateNumberType = {
  currentStep: 1,
  stepsTotal: 4,
  facebookAccessToken: "",
  businessId: "",
  businessName: "",
  facebookWabaId: "",
  facebookPhoneNumber: "",
  destinationPhoneNumberId: "",
  destinationMessagingHubWabaId: "",
  destinationMessagingHubPhoneNumberId: "",
  isOnPremises: false,
  channelName: "",
  isCompleted: false,
  verifiedCode: [],
  isClicked: false,
  scene: SceneTypeDict.steps,
  loading: false,
  messagingHubWabaId: "",
  reviewData: {
    facebookWabaName: "",
    whatsappPhoneNumber: "",
    whatsappDisplayName: "",
    channelName: "",
    facebookWabaBusinessName: "",
    facebookWabaBusinessVerificationStatus:
      BusinessVerificationStatusDict.Pending,
    facebookPhoneNumberNameStatus: "",
    facebookPhoneNumberMessagingLimitTier: "",
    facebookWabaBusinessId: "",
  },
  unconnectedBusiness: [],
  isSleekFlowNumberExist: false,
  isVerifyFail: false,
};
