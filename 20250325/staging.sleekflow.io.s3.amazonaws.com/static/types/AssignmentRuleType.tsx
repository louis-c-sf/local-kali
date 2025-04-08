import { AssigneeType, UserInfoType } from "./ConversationType";
import {
  FilterConditionCommonType,
  TargetedChannelType,
} from "./BroadcastCampaignType";
import { AbstractConditionField } from "../component/AssignmentRules/AutomationRuleEdit/fields/AbstractConditionField";
import { Moment } from "moment";
import { AutomationActionType } from "./AutomationActionType";
import { DropdownOptionType } from "../component/Chat/ChannelFilterDropdown";
import { UserProfileGroupType } from "../container/Contact/Imported/UserProfileGroupType";
import {
  FbIgAutomationHistoryType,
  PostCommentConditionField,
} from "../component/AssignmentRules/AutomationRuleEdit/CreateRule/FbIg/PostCommentTypes";

export type AssignmentStatusType = "Live" | "Draft" | "Saved";
export type LogicType = "And" | "Or";

export type CompoundConditionType =
  | AutomationConditionType
  | AutomationConditionType[];

export interface AssignmentRuleType {
  automationType: AutomationTypeEnum;
  automationActions: AutomationActionType[];
  id: string | undefined;
  ruleName: string;
  conditions: CompoundConditionType[];
  conditionFields: AbstractConditionField[];
  postCommentConditionFields?: PostCommentConditionField;
  channelsWithIds: TargetedChannelType[];
  assignmentType?: string | undefined;
  assignedUser?: UserInfoType | string | undefined;
  order: number;
  updatedAt: string;
  isDefault: boolean;
  status: AssignmentStatusType;
  schedule: AssignmentScheduleType | undefined;
  triggeredCounter: number;
  triggeredFailedCounter: number;
  triggeredSuccessCounter: number;
  isContinue: boolean;
  isPreview?: boolean;
}

export interface AssignmentRuleFormType extends AssignmentRuleType {
  associatedList?: UserProfileGroupType;
}

export type ScheduleIntervalType = "DAY" | "WEEK" | "YEAR" | "MONTH";

export interface AssignmentScheduleType {
  type: ScheduleIntervalType;
  amount: number[];
  time: Moment | undefined;
}

export default interface AssignmentResponseType {
  automationType: AutomationTypeEnum;
  automationActions: AutomationActionType[];
  assignmentId: string;
  assignmentRuleName: string;
  targetedChannels: string[];
  targetedChannelWithIds: TargetedChannelType[];
  conditions: CompoundConditionType[];
  assignedStaff?: AssigneeType;
  assignmentType: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  isDefault?: boolean;
  status: AssignmentStatusType;
  recurringSetting?: RecurringSettingType;
  triggeredCounter: number;
  triggeredFailedCounter: number;
  triggeredSuccessCounter: number;
  isContinue: boolean;
  associatedList?: UserProfileGroupType;
}

export const AutomationTypeDict = [
  "FieldValueChanged",
  "MessageReceived",
  "RecurringJob",
  "Assignment",
  "ContactAdded",
  "NewContactMessage",
  "ShopifyNewCustomerTrigger",
  "ShopifyUpdatedCustomerTrigger",
  "ShopifyNewOrUpdatedOrderTrigger",
  "ShopifyNewAbandonedCart",
  "ShopifyFulfillmentStatusTrigger",
  "FacebookPostComment",
  "InstagramMediaComment",
  "OutgoingMessageTrigger",
] as const;

export type AutomationTypeEnum = typeof AutomationTypeDict[number];

export interface AssignmentRuleRequestType {
  automationType: AutomationTypeEnum;
  automationActions: AutomationActionType[];
  order?: number | null;
  assignmentId?: string;
  assignmentRuleName: string;
  /* @deprecated */
  targetedChannels?: string[];
  targetedChannelWithIds?: TargetedChannelType[];
  conditions?: CompoundConditionType[];
  assignmentType?: string | number | null;
  teamAssignmentType?: string | null;
  staffId?: string | null;
  status: AssignmentStatusType;
  recurringSetting?: RecurringSettingType;
  isContinue: boolean;
  isPreview?: boolean;
}

export type RecurringSettingType = {
  dayOfWeek: number[] | null;
  dayOfMonth: number[] | null;
  month: number[] | null;
  hours: number | null;
  minutes: number | null;
};

export function flattenCondition(
  condition: CompoundConditionType
): AutomationConditionType[] {
  return [condition].flat(2);
}

export interface HasChoices {
  getChoices: () => DropdownOptionType[];
}

export function implementsHasChoices(o: any): o is HasChoices {
  if (!(o instanceof AbstractConditionField)) {
    return false;
  }
  return Reflect.has(o, "getChoices");
}

export type AutomationConditionType =
  | FilterConditionCommonType
  | FilterHashtagAutomationConditionType;

export type FilterHashtagAutomationConditionType = {
  containHashTag: "hashtags";
  conditionOperator:
    | "ContainsAll"
    | "IsNotContainsAll"
    | "ContainsAny"
    | "IsNotContainsAny" /* legacy -▶ */
    | "Contains"
    | "IsNotContains";
  values: string[];
  fieldName?: never;
  timeValueType?: never;
  nextOperator: LogicType;
};

export function isHashTagCondition(
  x: AutomationConditionType
): x is FilterHashtagAutomationConditionType {
  return x.containHashTag !== undefined;
}

export interface AutomationHistoryType {
  id: number;
  name: string;
  targetUserProfileId: string;
  targetAssignmentRuleId: string;
  isSendMessage: boolean;
  regexValue: string;
  conversationMessageId: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface AutomationHistoriesPaginationParamsType {
  offset: number;
  limit: number;
}

export interface AutomationHistoriesFilterParamsType {
  status?: number | undefined;
  start?: string | undefined;
  end?: string | undefined;
}

export interface AutomationHistoryResponseType {
  automationHistories: AutomationHistoryType[];
  count: number;
}

export interface SelectedAutomationRuleType {
  id: string | undefined;
  ruleName: string;
  isDefault: boolean;
  status: AssignmentStatusType;
  automationType: AutomationTypeEnum;
  automationHistories?: (AutomationHistoryType | FbIgAutomationHistoryType)[];
}

export interface AutomationResponseType {
  assignmentId: string;
  assignmentRuleName: string;
  assignmentType: string;
  automationActions: AutomationActionType[];
  automationType: AutomationTypeEnum;
  conditions: CompoundConditionType[];
  createdAt: string;
  isDefault: false;
  savedBy: {
    isShowName: false;
    locale: string;
    position: string;
    roleType: string;
    status: string;
    timeZoneInfoId: string;
  };
  status: AssignmentStatusType;
  targetedChannelWithIds: TargetedChannelType[];
  targetedChannels: string[];
  triggeredCounter: number;
  triggeredFailedCounter: number;
  triggeredSuccessCounter: number;
  updatedAt: string;
}

export interface AutomationReplayResponseType {
  message: string;
}
