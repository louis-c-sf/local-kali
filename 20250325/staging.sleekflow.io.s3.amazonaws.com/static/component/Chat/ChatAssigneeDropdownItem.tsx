import React, { useContext } from "react";
import { Dropdown, Image } from "semantic-ui-react";
import UnassigneeIcon from "../../assets/images/assignee-icon/unassigned-icon.svg";
import AllIcon from "../../assets/images/assignee-icon/all-icon.svg";
import MentionIcon from "../../assets/images/assignee-icon/mention-icon.svg";
import AssigneeFieldNameMapping from "../../config/AssigneeFieldNameMapping";
import Avatar from "react-avatar";
import { equals, pick, prop } from "ramda";
import { matchesStaffId, TeamType } from "../../types/TeamType";
import { useAssigneeFieldNameMapping } from "./localizable/useAssigneeFieldNameMapping";
import { useGetUserPicUrl } from "../../api/User/useGetUserPicUrl";
import { useAppSelector } from "../../AppRootContext";
import { htmlEscape } from "../../lib/utility/htmlEscape";

interface ChatAssigneeDropdownItemProps {
  assigneeName: string;
  handleAssigneeSelected: (assigneeName: string, assigneeId?: string) => void;
  assignmentNumber?: number;
  team?: TeamType;
  assigneeId?: string;
}

function ChatAssigneeDropdownItem(props: ChatAssigneeDropdownItemProps) {
  const { assigneeName, handleAssigneeSelected, assigneeId, team } = props;
  const { assignees, staffList, user, settings } = useAppSelector(
    pick(["assignees", "staffList", "user", "settings"]),
    equals
  );
  const { menuTitle } = useAssigneeFieldNameMapping();
  const assigneeIcons = {
    mentions: MentionIcon,
    all: AllIcon,
    unassigned: UnassigneeIcon,
    teamunassigned: UnassigneeIcon,
  };

  let myTeams = settings.teamsSettings.teams.filter((t) =>
    t.members.some((m) => m.userInfo.id === assigneeId)
  );
  if (team) {
    myTeams = myTeams.filter((t) => t.id !== team.id);
  }
  const loggedInUserTeams = settings.teamsSettings.teams.find((t) =>
    t.members.some(matchesStaffId(user.id))
  );

  const selectedStaff = staffList.find(
    (staff) =>
      (assigneeName.toLowerCase() === "you" && staff.userInfo.id === user.id) ||
      staff.userInfo.id === assigneeId
  );

  function getAssignmentsCount() {
    const lowerCaseAssigneeName = assigneeName.toLowerCase();
    if (lowerCaseAssigneeName === "all") {
      return assignees[assigneeName]?.totalAssigned ?? 0;
    }
    if (lowerCaseAssigneeName === "you") {
      if (selectedStaff) {
        if (selectedStaff.userInfo.id === user.id) {
          return assignees[user.id]?.totalAssigned ?? 0;
        }
      }
    }
    if (lowerCaseAssigneeName.includes("teamunassigned") && loggedInUserTeams) {
      return (
        assignees[`teamUnassigned:${loggedInUserTeams.id}`]?.totalAssigned ?? 0
      );
    }
    const assigneeNameConversion =
      AssigneeFieldNameMapping[lowerCaseAssigneeName];
    if (
      assigneeId ||
      (lowerCaseAssigneeName &&
        (assigneeNameConversion || assignees[lowerCaseAssigneeName]))
    ) {
      if (assigneeId) {
        return assignees[assigneeId]?.totalAssigned || 0;
      } else {
        return (
          (assigneeNameConversion &&
            assignees[assigneeNameConversion]?.totalAssigned >= 0 &&
            assignees[assigneeNameConversion]?.totalAssigned) ||
          0
        );
      }
    }
    return 0;
  }

  const handleOnClick = () => {
    if (assigneeId) {
      handleAssigneeSelected(assigneeName, assigneeId);
    } else {
      handleAssigneeSelected(assigneeName);
    }
  };

  const teamNames = myTeams.map(prop("name")).join(" / ");
  const profilePic = useGetUserPicUrl(selectedStaff);
  return (
    <Dropdown.Item
      onClick={handleOnClick}
      className={"primary"}
      text={
        <div>
          <div className="assignee-pic">
            {(assigneeIcons[assigneeName.toLowerCase()] && (
              <Image
                avatar
                rounded={true}
                src={assigneeIcons[assigneeName.toLowerCase()]}
              />
            )) ||
              (selectedStaff && profilePic && (
                <Image avatar rounded src={profilePic} />
              )) || (
                <Avatar
                  name={
                    assigneeName.toLowerCase() !== "you"
                      ? menuTitle(assigneeName)
                      : assigneeName
                  }
                  maxInitials={2}
                  round={true}
                />
              )}
          </div>
          <div className="info">
            {menuTitle(assigneeName)}
            <span className="assigned-number">
              {props.assignmentNumber ?? getAssignmentsCount()}
            </span>
            {teamNames && (
              <div className={"teams-list"} title={htmlEscape(teamNames)}>
                {teamNames}
              </div>
            )}
          </div>
        </div>
      }
    />
  );
}

export default ChatAssigneeDropdownItem;
