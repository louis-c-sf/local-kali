import CompanyType from "./CompanyType";
import { ProfileType } from "./LoginType";
import MessageType from "./MessageType";
import { TeamNormalizedType } from "./TeamType";
import { AssigneeType as LoginAssigneeType } from "./state/inbox/AssigneeType";

export interface UserInfoType {
  displayName: string;
  email: string;
  id: string;
  userName: string;
  userRole: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  createdAt: string;
}
export interface AssigneeType {
  locale: string;
  userInfo: UserInfoType;
  role?: string;
  name?: string;
  timeZone: number;
}

export interface StaffConversationIdsType {
  [key: string]: string;
}
export const tagColorsBase = [
  "Blue",
  "Pink",
  "Yellow",
  "Green",
  "Red",
  "Purple",
  "Grey",
  "Cyan",
] as const;

export type TagColorBaseType = typeof tagColorsBase[number];

export enum HashTagTypeEnum {
  normal = "Normal",
  shopify = "Shopify",
}
export interface HashTagType {
  id?: string;
  hashtag: string;
  hashTagColor: TagColorBaseType;
  hashTagType?: string;
}

export interface HashTagCountedType extends HashTagType {
  id: string;
  count: number;
}

export interface HashTagNormalizedType {
  id?: string;
  hashtag: string;
  hashTagColor: TagColorBaseType;
  hashTagType?: string;
}

export function normalizeHashTag(tag: HashTagType): HashTagNormalizedType {
  const normalized: HashTagNormalizedType = {
    hashtag: tag.hashtag,
    hashTagColor: tag.hashTagColor,
  };
  if (tag.hashTagType !== undefined) {
    normalized.hashTagType = tag.hashTagType;
  }
  if (tag.id !== undefined) {
    normalized.id = tag.id;
  }
  return normalized;
}

export function denormalizeHashTag(
  tag: HashTagCountedType
): HashTagCountedType {
  return {
    id: tag.id,
    hashtag: tag.hashtag,
    hashTagColor: tag.hashTagColor,
    count: tag.count,
  };
}

export default interface ConversationType extends ConversationNormalizedType {
  additionalAssignees: never;
}

export interface ConversationNormalizedType {
  id: string;
  assignee?: AssigneeType;
  company: CompanyType;
  companyId: string;
  conversationChannels: string[];
  conversationHashtags: HashTagType[];
  conversationId: string;
  messageGroupName: string;
  status: string;
  updatedTime: string;
  userProfile: ProfileType;
  lastMessage: MessageType[];
  unreadMessageCount: number;
  firstMessageId: number;
  isBookmarked: boolean;
  lastMessageChannel: string;
  lastMessageId: number;
  createdAt: string;
  updatedAt: string;
  assignedTeam?: TeamNormalizedType;
  readonly additionalAssignees: Array<{ assignee: LoginAssigneeType }>;
}
export interface SearchConversationMessageType
  extends ConversationNormalizedType {
  messages: MessageType[];
  unreadMessageCount: number;
}
export interface ProfileRemarksReceivedType {
  remarks: string;
  createdAt: Date;
  remarksStaff: AssigneeType;
  userProfileId: string;
  remarkId: string;
}
