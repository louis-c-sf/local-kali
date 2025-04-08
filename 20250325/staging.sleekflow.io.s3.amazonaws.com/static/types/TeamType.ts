import { eqBy } from "ramda";
import { TargetedChannelType } from "./BroadcastCampaignType";
import { StaffType } from "./StaffType";

export interface TeamNormalizedType {
  id: number;
  teamName: string;
  members: Array<StaffType>;
  teamAdmins: Array<StaffType>;
  lastUpdatedAt: string;
  defaultChannels: TargetedChannelType[];
}
export interface TeamType {
  id: number;
  name: string;
  teamAdmins: Array<StaffType>;
  members: Array<StaffType>;
  defaultChannels: TargetedChannelType[];
  lastUpdatedAt: string;
  qrCodeAssignmentType?: string;
  qrCodeChannel?: TargetedChannelType;
  qrCodeAssignmentStaffId?: string;
}

export function denormalizeTeam(team: TeamNormalizedType): TeamType {
  return {
    ...team,
    name: team.teamName,
  };
}

export function matchesStaff(staff: StaffType) {
  return (member: StaffType) => eqBy(getStaffId, staff, member);
}

export function matchesStaffId(staffId: string) {
  return (member: StaffType) => getStaffId(member) === staffId;
}

export function getStaffId(staff: StaffType) {
  return staff.userInfo.id;
}
