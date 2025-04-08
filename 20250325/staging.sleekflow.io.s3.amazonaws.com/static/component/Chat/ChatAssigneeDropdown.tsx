import React, { useState } from "react";
import { Dropdown } from "semantic-ui-react";
import ChatAssigneeDropdownItem from "./ChatAssigneeDropdownItem";
import ChatAssigneeSearchDropdown from "./ChatAssigneeSearchDropdown";
import { useHistory } from "react-router-dom";
import { AssignmentPopup } from "./AssignmentPopup";
import { matchesStaffId } from "../../types/TeamType";
import { useAccessRulesGuard } from "../Settings/hooks/useAccessRulesGuard";
import { useAssigneeFieldNameMapping } from "./localizable/useAssigneeFieldNameMapping";
import { useTranslation } from "react-i18next";
import { InfoTooltip } from "../shared/popup/InfoTooltip";
import { useCurrentUserDetail } from "../../api/User/useCurrentUserDetail";
import { useTeams } from "../../container/Settings/useTeams";
import useRouteConfig from "../../config/useRouteConfig";
import { useAppDispatch, useAppSelector } from "../../AppRootContext";
import { equals } from "ramda";
import { isStaffRole } from "component/Settings/helpers/AccessRulesGuard";

const nameList = ["you", "mentions", "unassigned", "all"];

const nameListIncludedTeamUnassigned = [
  "you",
  "mentions",
  "teamunassigned",
  "unassigned",
  "all",
];

const ChatAssigneeDropdown = () => {
  const user = useAppSelector((s) => s.user, equals);
  const staffList = useAppSelector((s) => s.staffList, equals);
  const selectedAssignee = useAppSelector((s) => s.selectedAssignee);
  const loginDispatch = useAppDispatch();
  const { refreshCurrentUserDetail } = useCurrentUserDetail();
  const { refreshTeams, teams } = useTeams();
  const history = useHistory();
  const accessRulesGuard = useAccessRulesGuard();

  const { menuTitle } = useAssigneeFieldNameMapping();
  const { t } = useTranslation();
  const { routeTo } = useRouteConfig();
  const assigneeTooltipMap = {
    you: t("chat.tooltip.assignee.you"),
    mentions: t("chat.tooltip.assignee.mentions"),
    unassigned: t("chat.tooltip.assignee.unassigned"),
    all: t("chat.tooltip.assignee.all"),
    teamunassigned: t("chat.tooltip.assignee.teamunassigned"),
  };

  const canSeeTeamUnassigned = teams.some((t) =>
    t.members.some(matchesStaffId(user.id))
  );
  const isStaff = useAppSelector(
    (s) => s.loggedInUserDetail && isStaffRole(s.loggedInUserDetail)
  );
  const assigneeList = canSeeTeamUnassigned
    ? nameListIncludedTeamUnassigned
    : nameList;
  const list = isStaff
    ? [...assigneeList.slice(0, assigneeList.length - 1)]
    : assigneeList;

  const handleSelectedAssignee = (
    selectedAssigneeName: string,
    selectedAssigneeId?: string
  ) => {
    setOpened(false);
    let updatedPathName = routeTo(`/inbox`);
    let updatedAssigneeName = selectedAssigneeName;
    let updatedAssigneeId = selectedAssigneeId;
    if (selectedAssignee.toLowerCase() !== selectedAssigneeName.toLowerCase()) {
      if (selectedAssigneeName.toLowerCase() === "you") {
        updatedPathName = `${updatedPathName}/${user.id}`;
        updatedAssigneeName = "You";
        updatedAssigneeId = user.id;
      } else if (
        nameListIncludedTeamUnassigned.includes(
          selectedAssigneeName.toLowerCase()
        )
      ) {
        updatedPathName = `${updatedPathName}/${selectedAssigneeName.toLowerCase()}`;
        updatedAssigneeId = selectedAssigneeName;
        updatedAssigneeName =
          selectedAssigneeName.charAt(0).toUpperCase() +
          selectedAssigneeName.substring(1);
      } else {
        updatedPathName = `${updatedPathName}/${
          selectedAssigneeId ?? selectedAssigneeName
        }`;
      }
      loginDispatch({ type: "CHATS_RESET" });
      loginDispatch({
        type: "INBOX.FILTER_UPDATE",
        selectedChannel: "all",
        selectedStatus: "open",
        selectedAssigneeId: updatedAssigneeId,
        assigneeName: updatedAssigneeName,
      });
      try {
        history.replace({
          pathname: updatedPathName,
          search: `selectedStatus=open&selectedChannel=all&selectedOrderBy=desc`,
        });
      } catch (e) {
        console.error(
          `handleSelectedAssignee redirect error ${e}, pathname: ${updatedPathName}`
        );
        history.replace({
          pathname: routeTo(
            `/inbox/${
              updatedAssigneeId?.toLowerCase() ?? selectedAssigneeId ?? "all"
            }`
          ),
          search: `selectedStatus=open&selectedChannel=all&selectedOrderBy=desc`,
        });
      }
    }
  };

  const [triggerNode, setTriggenNode] = useState<HTMLElement | null>(null);
  const [opened, setOpened] = useState(false);

  return (
    <>
      <InfoTooltip
        placement={"right"}
        children={t("chat.tooltip.assigneeFilter")}
        trigger={
          <div
            className={"ui dropdown inline assignee-filter"}
            ref={setTriggenNode}
            onClick={() => {
              if (!opened) {
                refreshTeams();
                refreshCurrentUserDetail();
              }
              setOpened(!opened);
            }}
          >
            <span className="selected-assignee">
              {menuTitle(selectedAssignee)}
            </span>
            <i className="dropdown icon"></i>
          </div>
        }
      />

      <AssignmentPopup
        opened={opened}
        setOpened={setOpened}
        anchorNode={triggerNode}
        className={"assignee-filter__popup"}
        offset={[0, 15]}
        placement={"bottom-start"}
      >
        <Dropdown.Menu
          scrolling
          className="assignee-filter__menu no-scrollbars"
        >
          {staffList.length > 0 && user?.id
            ? list.map((assignee, i) => (
                <InfoTooltip
                  placement={"right"}
                  children={assigneeTooltipMap[assignee] ?? null}
                  trigger={
                    <ChatAssigneeDropdownItem
                      handleAssigneeSelected={handleSelectedAssignee}
                      assigneeName={assignee}
                    />
                  }
                  key={assignee}
                />
              ))
            : null}
          {opened && accessRulesGuard.canSeeOtherAssigneesConversation() && (
            <ChatAssigneeSearchDropdown
              handleAssigneeSelected={handleSelectedAssignee}
              opened={opened}
            />
          )}
        </Dropdown.Menu>
      </AssignmentPopup>
    </>
  );
};
export default ChatAssigneeDropdown;
