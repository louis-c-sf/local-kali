import {
  BusinessVerificationStatusDictEnum,
  NewNumberInfoType,
} from "component/CreateWhatsappFlow/types";

export const LanguageDict = {
  cantonese: "zh_HK",
  mainland: "zh_CN",
  taiwan: "zh_TW",
  english: "en_US",
} as const;
type LanguageDictType = typeof LanguageDict;
export type LanguageDictEnum = LanguageDictType[keyof LanguageDictType];

export const CodeMethodDict = {
  SMS: "SMS",
  Voice: "VOICE",
};
type CodeMethodDictType = typeof CodeMethodDict;
type CodeMethodDictKey = keyof CodeMethodDictType;
export type CodeMethodDictEnum = CodeMethodDictType[CodeMethodDictKey];

export const SceneTypeDict = {
  steps: "steps",
  channelName: "channelName",
  final: "final",
} as const;
export type SceneTypeDictEnum = keyof typeof SceneTypeDict;

export type OptionType = {
  key: string;
  text: string;
  value: string | boolean;
  isPinEnable?: boolean;
};

export type WabaType = {
  facebook_waba_id: string;
  facebook_waba_name: string;
  account_review_status: string;
  bsp_name: string;
  is_pin_enabled: boolean;
};

export const VerifyMethodDict = {
  sms: "SMS",
  voice: "VOICE",
} as const;
type VerifyMethodType = typeof VerifyMethodDict;
type VerifyMethodKey = keyof VerifyMethodType;
export type VerifyMethodDictEnum = VerifyMethodType[VerifyMethodKey];

export type NextButtonInfoType = {
  step: number;
  showButton: boolean;
  text: string;
};

export const StepsDict = {
  info: 1,
  selectWaba: 2,
  dropdowns: 3,
  verifyCode: 4,
} as const;

export const LAST_GET_CODE_TIME_STORAGE = "last_get_code_time";

export type ConnectedWhatsappCloudApiConfigType = {
  facebookWabaName: string;
  whatsappPhoneNumber: string;
  whatsappDisplayName: string;
  channelName: string;
  facebookWabaBusinessName: string;
  facebookWabaBusinessVerificationStatus: BusinessVerificationStatusDictEnum;
  facebookPhoneNumberNameStatus: string;
  facebookPhoneNumberMessagingLimitTier: string;
  facebookWabaBusinessId: string;
};

export interface ReviewDataType extends NewNumberInfoType {
  facebookWabaBusinessName?: string;
}
