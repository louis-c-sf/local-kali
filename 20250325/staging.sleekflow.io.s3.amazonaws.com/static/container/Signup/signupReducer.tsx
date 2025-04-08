import produce from "immer";

export interface SignupState {
  registerInfo: RegisterInfoType;
  steps: number;
}

export interface RegisterInfoType {
  isAgreeMarketingConsent: boolean;
  firstName: string;
  lastName: string;
  companyName: string;
  phoneNumber: string;
  heardFrom?: string;
  promoCode: string;
  industry?: string;
  onlineShopSystem?: string;
  channels: string[];
  timeZoneInfoId?: string;
  companySize?: string;
  companyWebsite: string;
  isEmptyChannel: boolean;
  location?: string;
  connectionStrategy?: string;
}

export type SignupAction =
  | {
      type: "NEXT_STEP";
      updatedRegisterInfo?: Partial<RegisterInfoType>;
    }
  | {
      type: "PREV_STEP";
      updatedRegisterInfo?: Partial<RegisterInfoType>;
    }
  | {
      type: "UPDATE_INFO";
      updatedRegisterInfo: Partial<RegisterInfoType>;
    }
  | {
      type: "INVALID_INFORMATION";
    }
  | {
      type: "CLEAR_INFO";
    };

const signupReducer: React.Reducer<SignupState, SignupAction> = produce(
  (draft: SignupState, action) => {
    switch (action.type) {
      case "NEXT_STEP":
        draft.steps = draft.steps + 1;
        draft.registerInfo = {
          ...draft.registerInfo,
          ...action.updatedRegisterInfo,
        };
        break;
      case "PREV_STEP":
        draft.steps = draft.steps - 1;
        draft.registerInfo = {
          ...draft.registerInfo,
          ...action.updatedRegisterInfo,
        };
        break;
      case "UPDATE_INFO":
        draft.registerInfo = {
          ...draft.registerInfo,
          ...action.updatedRegisterInfo,
        };
        break;
      case "CLEAR_INFO":
        draft.registerInfo = {
          ...defaultState.registerInfo,
        };
        draft.steps = 0;
    }
  }
);

export const defaultState: SignupState = {
  registerInfo: {
    lastName: "",
    firstName: "",
    companyName: "",
    heardFrom: "",
    promoCode: "",
    phoneNumber: "",
    industry: "",
    onlineShopSystem: "",
    channels: [],
    timeZoneInfoId: "",
    companyWebsite: "",
    isAgreeMarketingConsent: true,
    isEmptyChannel: false,
    location: "",
  },
  steps: 0,
};
export default signupReducer;
