import { CustomFieldTypeDict } from "../types/ContactType";

export const HASHTAG_FIELD_NAME = "@hashtag";
export const LIST_FIELD_NAME = "importfrom";
export const HASHTAG_FIELD_DISPLAY_NAME = "Labels";
export const LANGUAGE_FIELD_TYPE = "Language";
export const LANGUAGE_FIELD_NAME = "Language";

export const AWAY_STATUS_TYPE = "AwayStatus";
export const AWAY_STATUS_FIELD_NAME = "ContactOwner";
export const AWAY_STATUS_FIELD_NAME_DENORMALIZED = "@AwayStatus";
export const AWAY_CONDITION_OPERATOR = "IsAway";
export const ACTIVE_CONDITION_OPERATOR = "IsActive";
export const AWAY_SUPPORTED_CONDITIONS = [
  AWAY_CONDITION_OPERATOR,
  ACTIVE_CONDITION_OPERATOR,
] as const;

export const ProfileChannelField = {
  whatsapp: "whatsAppAccount",
  facebook: "facebookAccount",
  web: "webClient",
  email: "emailAddress",
  note: "messageAssignee",
  wechat: "weChatUser",
  instagram: "instagramUser",
  whatsapp360dialog: "whatsApp360DialogUser",
  whatsappcloudapi: "whatsappCloudApiUser",
} as const;

const ConditionNameEnum = [
  "Equals",
  "HigherThan",
  "LesserThan",
  "LessThan",
  "Contains",
  "Contains_And",
  "Contains_Or",
  "ContainsAll",
  "ContainsAny",
  "IsNotContainsAll",
  "IsNotContainsAny",
  "IsNotContains",
  "IsNotContains_And",
  "IsNotContains_Or",
  "IsNull",
  "IsNotNull",
  "IsChanged",
  "IsBetween",
  "IsNotBetween",
  "TimeBefore",
  "TimeAfter",
  "DateBeforeDayAgo",
  "DateAfterDayAgo",
  "IsExactlyDaysBefore",
  "IsExactlyDaysAfter",
  "IsToday",
  "DayOfWeek",
  "IsNotContainsExactly",
  "ContainsExactly",
  "RegexMatched",
  AWAY_CONDITION_OPERATOR,
  ACTIVE_CONDITION_OPERATOR,
] as const;

export type ConditionNameType = typeof ConditionNameEnum[number];

export function isFilterConditionType(x: unknown): x is ConditionNameType {
  return typeof x === "string" && ConditionNameEnum.includes(x as any);
}

export const ProfileFieldsMapping = {
  Email: ["emailAddress", "email"],
  Facebook: ["facebookAccount", "name"],
  Whatsapp: ["whatsAppAccount", "name"],
  line: ["lineUser", "displayName"],
  webClient: ["webClient", "webClientUUID"],
  WeChat: ["weChatUser", "nickname"],
  Instagram: ["instagramUser", "username"],
} as const;

export const CreateProfileCustomExcludedFieldConfig = [
  "name",
  "firstName",
  "lastName",
  "LastContactFromCustomers",
  "LastContact",
  "LastChannel",
] as const;

export interface StaticFieldType {
  fieldName: string;
  fieldType: CustomFieldTypeDict | string;
  fieldApiAlias?: string;
  operatorsInclude?: Readonly<ConditionNameType[]>;
  operatorsExclude?: Readonly<ConditionNameType[]>;
}

export const STATIC_FIELDS: Readonly<StaticFieldType[]> = [
  {
    fieldName: "firstname",
    fieldType: "singlelinetext",
  },
  {
    fieldName: "lastname",
    fieldType: "singlelinetext",
  },
  {
    fieldName: "createdAt",
    fieldType: "datetime",
  },
  {
    fieldName: LIST_FIELD_NAME,
    fieldType: "importfrom",
  },
  {
    fieldName: "Message",
    fieldType: "Keywords",
    operatorsExclude: ["RegexMatched"],
  },
  {
    fieldName: AWAY_STATUS_FIELD_NAME_DENORMALIZED,
    fieldType: AWAY_STATUS_TYPE,
  },
  {
    fieldName: "ConversationStatus",
    fieldType: "ConversationStatus",
  },
  {
    fieldName: HASHTAG_FIELD_NAME,
    fieldType: HASHTAG_FIELD_NAME,
  },
  {
    fieldName: "Language",
    fieldType: LANGUAGE_FIELD_TYPE,
  },
  {
    fieldName: "MessageRegex",
    fieldType: "regex",
    fieldApiAlias: "Message",
    operatorsInclude: ["RegexMatched"],
  },
] as const;

export type StaticFieldName = StaticFieldType["fieldName"];
export type StaticFieldMap = { [k in StaticFieldName]: string };
