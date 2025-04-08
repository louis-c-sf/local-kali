import { postWithExceptions } from "../apiRequest";
import { POST_CONVERSATIONS_ASSIGN_STAFF } from "../apiPath";
import { NO_TEAM_ID } from "../../component/Chat/TeamCollapsible";
import { TeamNormalizedType } from "../../types/TeamType";
import { AssigneeType } from "../../types/state/inbox/AssigneeType";
import { StaffType } from "../../types/StaffType";

export type AssignStaffResponse = {
  assignee: StaffType;
  assignedTeam: TeamNormalizedType;
  readonly additionalAssignees: Array<{ assignee: AssigneeType }>;
  conversationId: string;
  companyId: string;
  status: string;
};

export async function submitAssignStaff(
  conversationId: string,
  staffIdOrAlias?: string,
  teamId?: number,
  teamAssignmentType?: string,
  collaboratorIds?: string[]
): Promise<AssignStaffResponse> {
  const param: any = { assignmentType: "SpecificPerson" };
  if (teamId && teamId !== NO_TEAM_ID) {
    param.teamId = teamId;
    param.teamAssignmentType = "SpecificPerson";
    param.assignmentType = "SpecificGroup";
  }
  if (staffIdOrAlias) {
    param.staffId = staffIdOrAlias;
  }
  if (teamAssignmentType) {
    param.teamAssignmentType = teamAssignmentType;
  }
  if (collaboratorIds) {
    param.additionalAssigneeIds = collaboratorIds;
  }

  return await postWithExceptions(
    POST_CONVERSATIONS_ASSIGN_STAFF.replace("{id}", conversationId),
    { param }
  );
}
