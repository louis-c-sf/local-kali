import { matchesStaff, matchesStaffId, TeamType } from "../../types/TeamType";
import React, { useEffect, useMemo, useState } from "react";
import { getQueryMatcher } from "../../container/Settings/filters/getQueryMatcher";
import {
  append,
  both,
  either,
  equals,
  evolve,
  filter,
  map,
  reject,
  update,
} from "ramda";
import { UserType } from "../../types/LoginType";
import { staffDisplayName } from "./utils/staffDisplayName";
import { useTranslation } from "react-i18next";
import { useTeams } from "../../container/Settings/useTeams";
import { useAppSelector } from "../../AppRootContext";
import { StaffType } from "../../types/StaffType";

export const NO_TEAM_ID = 0;

function intelliSortTeams(teams: TeamType[], me: UserType) {
  return [...teams].sort((a, b) => {
    return getTeamWeight(b) - getTeamWeight(a);
  });

  function getTeamWeight(team: TeamType) {
    if (team.id === NO_TEAM_ID) {
      return -1;
    }
    const meInTeam = team.members.find(matchesStaffId(me.id));
    if (meInTeam) {
      return meInTeam.roleType === "TeamAdmin" ? 2 : 1;
    }
    return 0;
  }
}

export function useCollapsibleTeams(props: {
  allTeams: TeamType[];
  opened: boolean;
  searchQuery?: string;
  isUserVisible?: (user: StaffType) => boolean;
}) {
  const { allTeams, searchQuery, opened } = props;
  const [settings, staffList, user] = useAppSelector(
    (s) => [s.settings, s.staffList, s.user],
    equals
  );
  const isUserVisible = props.isUserVisible ?? (() => true);
  const { teams: companyTeams } = useTeams();

  const [collapseMap, setCollapseMap] = useState<Array<[number, boolean]>>([]);
  const { t } = useTranslation();

  const teamMatcher = getQueryMatcher((t: TeamType) => t.name);
  const userMatcher = getQueryMatcher(staffDisplayName);

  const byId = (id: number) => (record: [number, boolean]) => record[0] === id;

  let teamsFiltered = intelliSortTeams(allTeams, user);

  const usersWithoutTeams = useMemo(
    () =>
      reject(
        (s) => allTeams.some((t) => t.members.some(matchesStaff(s))),
        staffList
      ).filter(
        both((s) => staffDisplayName(s).trim().length > 0, isUserVisible)
      ),
    [JSON.stringify([staffList, allTeams])]
  );

  if (usersWithoutTeams.length > 0) {
    teamsFiltered.push({
      name: t("chat.team.allOther"),
      members: [...usersWithoutTeams],
      teamAdmins: [],
      id: NO_TEAM_ID,
      lastUpdatedAt: "",
      defaultChannels: [],
    });
  }

  if (searchQuery !== undefined) {
    teamsFiltered = teamsFiltered
      .filter(
        either(teamMatcher(searchQuery), (t) =>
          t.members.some(userMatcher(searchQuery))
        )
      )
      .map((t) => {
        const usersMatched = t.members.filter(userMatcher(searchQuery));
        return {
          ...t,
          members: usersMatched.length > 0 ? usersMatched : t.members,
        };
      });
  }
  teamsFiltered = teamsFiltered
    .map(evolve({ members: filter(isUserVisible) }))
    .filter((t) => t.members.length > 0);

  function isCollapsed(teamId: number) {
    const mapRecord = collapseMap.find(byId(teamId));
    return mapRecord ? mapRecord[1] : defaultCollapse(teamId);
  }

  function defaultCollapse(teamId: number) {
    if (teamId === NO_TEAM_ID) {
      return companyTeams.some((t) => t.members.some(matchesStaffId(user.id)));
    }
    const team = companyTeams.find((t) => t.id === teamId);

    return !team?.members.some(matchesStaffId(user.id));
  }

  useEffect(() => {
    setCollapseMap(
      settings.teamsSettings.teams.map((t) => [t.id, isCollapsed(t.id)])
    );
  }, [
    JSON.stringify(settings.teamsSettings.teams),
    settings.teamsSettings.teamsLoaded,
  ]);

  useEffect(() => {
    if (!opened) {
      setCollapseMap(
        map(([id, collapsed]) => {
          const newCollapsed =
            id === NO_TEAM_ID ? defaultCollapse(NO_TEAM_ID) : collapsed;
          return [id, newCollapsed];
        })
      );
    }
  }, [opened]);

  function toggleCollapse(id: number) {
    const indexToUpdate = collapseMap.findIndex(byId(id));
    const newValue: typeof collapseMap[number] = [id, !isCollapsed(id)];
    if (indexToUpdate > -1) {
      setCollapseMap(update(indexToUpdate, newValue));
    } else {
      setCollapseMap(append(newValue));
    }
    return newValue[1];
  }

  return {
    teamsCollapsible: teamsFiltered,
    toggleCollapse,
    isCollapsed: isCollapsed,
  };
}

export function TeamCollapsible(props: {
  team: TeamType;
  renderItem: (staff: StaffType, index: number) => React.ReactNode;
  collapsed: boolean;
  toggle: (id: number) => void;
  prependTeams?: () => React.ReactNode;
}) {
  const { team, renderItem, collapsed, toggle, prependTeams } = props;

  return (
    <div
      className={"item collapsible"}
      onClick={(event) => {
        event.stopPropagation();
        toggle(team.id);
      }}
    >
      <div
        className={`collapsible__name collapsible__name_${
          collapsed ? "collapsed" : "uncollapsed"
        }`}
      >
        {team.name}
      </div>
      <div
        className={`collapsible__wrap collapsible__wrap_${
          collapsed ? "collapsed" : "uncollapsed"
        }`}
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        {prependTeams && prependTeams()}
        {team.members.map(renderItem)}
      </div>
    </div>
  );
}
