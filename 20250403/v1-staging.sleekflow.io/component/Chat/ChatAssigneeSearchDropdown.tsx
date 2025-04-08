import { pick, propEq, reject } from "ramda";
import React, { useEffect, useState } from "react";
import { Dropdown, Input, InputOnChangeData } from "semantic-ui-react";
import { matchesStaff, matchesStaffId, TeamType } from "../../types/TeamType";
import { useAccessRulesGuard } from "../Settings/hooks/useAccessRulesGuard";
import ChatAssigneeDropdownItem from "./ChatAssigneeDropdownItem";
import {
  NO_TEAM_ID,
  TeamCollapsible,
  useCollapsibleTeams,
} from "./TeamCollapsible";
import { staffDisplayName } from "./utils/staffDisplayName";
import { useTranslation } from "react-i18next";
import { fetchChatsSummary } from "../../api/Chat/fetchChatsSummary";
import { useChatsFilterBuilder } from "../../api/Chat/useChatsFilterBuilder";
import { useAppDispatch, useAppSelector } from "../../AppRootContext";

const ChatAssigneeSearchDropdown = (props: {
  handleAssigneeSelected: (assigneeName: string, assigneeId?: string) => void;
  opened: boolean;
}) => {
  const { handleAssigneeSelected, opened } = props;
  const { settings, loggedInUserDetail, profile } = useAppSelector(
    pick(["settings", "loggedInUserDetail", "profile"])
  );
  const summary = useAppSelector((s) => s.inbox.summary);
  const loginDispatch = useAppDispatch();

  const [searchText, setSearchText] = useState("");
  const accessGuard = useAccessRulesGuard();
  let teams = settings.teamsSettings.teams.filter(
    (t: TeamType) => t.members.length > 0
  );
  const { t } = useTranslation();

  const { isCollapsed, teamsCollapsible, toggleCollapse } = useCollapsibleTeams(
    {
      allTeams: [...teams],
      searchQuery: searchText,
      opened,
    }
  );

  const { currentFilter } = useChatsFilterBuilder();

  useEffect(() => {
    teamsCollapsible
      .filter((t) => !isCollapsed(t.id) && t.id !== NO_TEAM_ID)
      .forEach((t) => {
        updateTeamStats(t.id);
      });
  }, [profile.conversationId, JSON.stringify(teamsCollapsible)]);

  const handleSearchChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    data: InputOnChangeData
  ) => {
    e.stopPropagation();
    setSearchText(data.value as string);
  };

  const fetchTeamStats = async (teamId: number) => {
    return await fetchChatsSummary({
      ...currentFilter,
      teamId: String(teamId),
    });
  };

  async function updateTeamStats(teamId: number) {
    const stats = await fetchTeamStats(teamId);
    loginDispatch({
      type: "INBOX.FILTER.UPDATE_TEAM_SUMMARY",
      teamId,
      summary: stats,
    });
  }

  async function handleTeamCollapse(teamId: number) {
    const collapsed = toggleCollapse(teamId);
    if (teamId === NO_TEAM_ID) {
      return;
    }
    if (!collapsed) {
      updateTeamStats(teamId);
    }
  }

  const stopClickEvent = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  let teamsCollapsibleFiltered = teamsCollapsible
    .map((t) => {
      return {
        ...t,
        members: reject(matchesStaff(loggedInUserDetail!), t.members),
      };
    })
    .filter((t) => t.members.length > 0);

  if (accessGuard.canSeeOnlyOwnTeamConversation()) {
    teamsCollapsibleFiltered = teamsCollapsibleFiltered.filter((t) => {
      const allMembers = teams.find(propEq("id", t.id))?.members ?? [];
      return (
        t.id !== NO_TEAM_ID &&
        allMembers.some(matchesStaffId(loggedInUserDetail!.userInfo.id))
      );
    });
  }

  return (
    <>
      <Dropdown.Item onClick={stopClickEvent} className="input-filter">
        <Input
          icon={"search"}
          iconPosition="left"
          placeholder={t("chat.form.input.search.placeholder")}
          onChange={handleSearchChange}
          value={searchText}
        />
      </Dropdown.Item>
      <div className="team-list">
        {teamsCollapsibleFiltered.map((team, i) => {
          return (
            <TeamCollapsible
              team={team}
              key={i}
              collapsed={searchText.length > 0 ? false : isCollapsed(team.id)}
              toggle={handleTeamCollapse}
              renderItem={(staff, index) => {
                const teamSummary = summary.teams[team.id] ?? {};
                return (
                  <ChatAssigneeDropdownItem
                    handleAssigneeSelected={handleAssigneeSelected}
                    assigneeName={staffDisplayName(staff)}
                    assigneeId={staff.userInfo.id}
                    team={team}
                    key={index}
                    assignmentNumber={
                      team.id !== NO_TEAM_ID
                        ? teamSummary[staff.userInfo.id] ?? 0
                        : undefined
                    }
                  />
                );
              }}
            />
          );
        })}
      </div>
    </>
  );
};
export default ChatAssigneeSearchDropdown;
