import React, { useEffect, useRef, useState } from "react";
import { Dropdown, Input, Ref } from "semantic-ui-react";
import { StaffItemAvatar } from "../StaffItemAvatar";
import ChatAssignmentStaff from "../ChatAssignmentStaff";
import { useFlashMessageChannel } from "../../BannerMessage/flashBannerMessage";
import {
  NO_TEAM_ID,
  TeamCollapsible,
  useCollapsibleTeams,
} from "../TeamCollapsible";
import { staffDisplayName } from "../utils/staffDisplayName";
import { equals, evolve, pick, prop, reject } from "ramda";
import {
  denormalizeTeam,
  getStaffId,
  matchesStaff,
  matchesStaffId,
  TeamNormalizedType,
  TeamType,
} from "../../../types/TeamType";
import { AssignmentPopup } from "../AssignmentPopup";
import { useTranslation } from "react-i18next";
import { TeamAssignActions } from "../ChatAssignment/TeamAssignActions";
import { fetchStaffList } from "../../../api/User/fetchStaffList";
import { submitAssignStaff } from "../../../api/Chat/submitAssignStaff";
import { useAppDispatch, useAppSelector } from "../../../AppRootContext";
import headerDropdownStyles from "./HeaderDropdown.module.css";
import { StaffType } from "../../../types/StaffType";
import { htmlEscape } from "../../../lib/utility/htmlEscape";

export default ChatAssignment;

function ChatAssignment() {
  const { profile, settings, staffList, selectedUser } = useAppSelector(
    pick(["profile", "settings", "staffList", "selectedUser"]),
    equals
  );
  const loginDispatch = useAppDispatch();
  const flash = useFlashMessageChannel();
  const [inputText, setInputText] = useState("");
  const [triggerNode, setTriggerNode] = useState<HTMLElement | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [opened, setOpened] = useState(false);
  const [loading, setLoading] = useState(false);

  const { t } = useTranslation();

  const teams = settings.teamsSettings.teams;

  const { isCollapsed, teamsCollapsible, toggleCollapse } = useCollapsibleTeams(
    {
      allTeams: [...teams],
      searchQuery: inputText,
      opened,
    }
  );

  useEffect(() => {
    if (staffList.length > 0) {
      if (staffList[0].userInfo.id === "") {
        fetchStaffList(loginDispatch);
      }
    }
  }, [JSON.stringify([staffList, selectedUser])]);

  async function handleSelectedStaff(
    name: string,
    id: string,
    team?: TeamType
  ) {
    // send a request to update assigned staff
    const selectedUser = staffList.find(matchesStaffId(id));
    setOpened(false);
    setLoading(true);
    try {
      await submitAssignStaff(profile.conversationId, id || name, team?.id);
      setLoading(false);
      if (id) {
        if (team) {
          flash(
            t("flash.inbox.chat.assigned.id.team", {
              name: htmlEscape(name),
              team: htmlEscape(team.name),
            })
          );
        } else {
          flash(
            t("flash.inbox.chat.assigned.id.id", { name: htmlEscape(name) })
          );
        }
      } else {
        flash(
          t("flash.inbox.chat.assigned.name.name", { name: htmlEscape(name) })
        );
      }
    } catch (e) {
      console.error("handleSelectedStaff", e);
      loginDispatch({
        type: "ASSIGNEE_UPDATED",
        profile: {
          ...profile,
        },
        conversationId: profile.conversationId,
        selectedUser: profile.assignee,
      });
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    e.stopPropagation();
    e.preventDefault();
    setInputText(e.target.value);
  }

  async function sendAssignTeam(
    teamId: number,
    type: string
  ): Promise<{
    assignee?: StaffType;
    assignedTeam?: TeamNormalizedType;
  }> {
    return await submitAssignStaff(
      profile.conversationId,
      undefined,
      teamId,
      type
    );
  }

  function handleAssignTeam(team: TeamType) {
    return async (type: string) => {
      try {
        const result = await sendAssignTeam(team.id, type);
        const assignee = result.assignee;
        loginDispatch({
          type: "ASSIGNEE_UPDATED",
          conversationId: profile.conversationId,
          profile: {
            ...profile,
            assignedTeam: result.assignedTeam
              ? denormalizeTeam(result.assignedTeam)
              : undefined,
          },
          selectedUser: assignee?.userInfo ?? undefined,
        });
        if (type === "unassigned") {
          flash(
            t("flash.inbox.chat.assigned.team.unassigned", {
              team: htmlEscape(team.name),
            })
          );
        } else if (type === "queuebased") {
          if (assignee) {
            flash(
              t("flash.inbox.chat.assigned.queue.name", {
                name: staffDisplayName(assignee),
                team: team.name,
              })
            );
          }
          flash(
            t("flash.inbox.chat.assigned.queue.queue", {
              team: htmlEscape(team.name),
            })
          );
        }
      } catch (e) {
        console.error("handleAssignTeam error", e);
      }
    };
  }

  const teamsVisible = teamsCollapsible
    .map<TeamType>(
      evolve({
        members: reject(matchesStaffId(selectedUser?.id ?? "")),
      })
    )
    .filter((t) => t.members.length > 0);

  return (
    <div className={`ui dropdown search-list ${headerDropdownStyles.dropdown}`}>
      <Ref innerRef={setTriggerNode}>
        <ChatAssignmentStaff loading={loading} selectedUser={selectedUser} />
      </Ref>
      <AssignmentPopup
        anchorNode={triggerNode}
        opened={opened}
        setOpened={setOpened}
        offset={[15, 15]}
      >
        <div className={" menu visible"} ref={popupRef}>
          <Input
            icon="search"
            fluid
            iconPosition="left"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            value={inputText}
            onChange={handleInput}
            placeholder={t("chat.form.input.search.placeholder")}
          />
          {opened && (
            <Dropdown.Menu scrolling className="team-list no-scrollbars">
              {teamsVisible.map((team, idx) => {
                return (
                  <TeamCollapsible
                    team={team}
                    toggle={toggleCollapse}
                    collapsed={
                      inputText.length > 0 ? false : isCollapsed(team.id)
                    }
                    key={idx}
                    prependTeams={() => {
                      if (team.id === NO_TEAM_ID) {
                        return null;
                      }
                      return (
                        <TeamAssignActions
                          visible={!isCollapsed(team.id)}
                          onAssign={handleAssignTeam(team)}
                        />
                      );
                    }}
                    renderItem={(member, index) => {
                      const staff =
                        staffList.find(matchesStaff(member)) ?? member;
                      const value =
                        staff.userInfo.displayName || staff.userInfo.email;
                      const staffDisplay = {
                        name: staff.userInfo.displayName || "",
                        profilePictureURL: staff.profilePictureURL,
                        profilePicture: staff.profilePicture,
                        ...staff.userInfo,
                      };
                      const memberTeams = settings.teamsSettings.teams
                        .filter((t) => t.members.some(matchesStaff(staff)))
                        .filter((t) => t.id !== team.id);
                      const teamNames = memberTeams
                        .map(prop("name"))
                        .join(" / ");

                      return (
                        <Dropdown.Item
                          onClick={() =>
                            handleSelectedStaff(value, getStaffId(staff), team)
                          }
                          className="search-staff"
                          key={`${index} ${getStaffId(staff)}`}
                        >
                          <div className={`staff`}>
                            {staffDisplay && (
                              <>
                                <StaffItemAvatar staff={staffDisplay} />
                                <div className={"info"}>
                                  <div className="name">
                                    {staff
                                      ? staffDisplayName(staff)
                                      : JSON.stringify(staff)}
                                  </div>
                                  {teamNames && (
                                    <div
                                      className="teams-list"
                                      title={teamNames}
                                    >
                                      {teamNames}
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </Dropdown.Item>
                      );
                    }}
                  />
                );
              })}
              {Boolean(selectedUser) && (
                <Dropdown.Item
                  className={"top"}
                  onClick={() => {
                    handleSelectedStaff("unassigned", "");
                  }}
                  text={t("chat.filter.assignee.unassigned")}
                />
              )}
            </Dropdown.Menu>
          )}
        </div>
      </AssignmentPopup>
    </div>
  );
}
