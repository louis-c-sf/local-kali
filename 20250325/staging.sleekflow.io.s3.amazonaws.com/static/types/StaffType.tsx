import { UserInfoType } from "./ConversationType";
import TimeZoneInfoType from "./TimeZoneInfoType";
import { ProfilePictureType } from "./LoginType";
import { defaultAssigee } from "./state/inbox/AssigneeType";
import { TargetedChannelType } from "./BroadcastCampaignType";

export enum RbacDefaultRole {
  SUPER_ADMIN = "SuperAdmin",
  ADMIN = "Admin",
  TEAM_ADMIN = "TeamAdmin",
  STAFF = "Staff",
}

interface RbacRole {
  role_id: string;
  role_name: RbacDefaultRole | string;
  is_default: boolean;
}
export interface StaffType {
  staffId: number;
  userInfo: UserInfoType;
  locale: string;
  timeZone: number;
  timeZoneInfoId: string;
  roleType: string;
  timeZoneInfo: TimeZoneInfoType;
  name: string;
  position?: string;
  profilePictureURL?: string;
  profilePicture?: ProfilePictureType;
  status: string;
  message?: string;
  isAcceptedInvitation: boolean;
  isShowName: boolean;
  isNewlyRegistered: boolean;
  qrCodeIdentity: string;
  qrCodeChannel?: TargetedChannelType;
  defaultCurrency?: string;
  rbacRoles: RbacRole[];
}

export const defaultStaff: StaffType = {
  staffId: 0,
  userInfo: defaultAssigee.userInfo as UserInfoType,
  locale: "",
  timeZone: 0,
  name: "",
  position: "",
  timeZoneInfoId: "",
  roleType: "",
  status: "Active",
  isAcceptedInvitation: true,
  message: "",
  isShowName: false,
  isNewlyRegistered: false,
  timeZoneInfo: {
    id: "",
    displayName: "",
    standardName: "",
    baseUtcOffset: "",
    baseUtcOffsetInHour: 0,
  },
  qrCodeIdentity: "",
  rbacRoles: [],
};
