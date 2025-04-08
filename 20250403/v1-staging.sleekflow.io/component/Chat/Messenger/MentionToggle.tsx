import React, { useRef, useState } from "react";
import { Button, Dropdown, Icon, Input } from "semantic-ui-react";
import { staffDisplayName } from "../utils/staffDisplayName";
import { StaffItemAvatar } from "../StaffItemAvatar";
import { TeamCollapsible, useCollapsibleTeams } from "../TeamCollapsible";
import { evolve, reject } from "ramda";
import { useCloseOnClickOutside } from "../../shared/popup/useCloseOnClickOutside";
import { TeamType } from "../../../types/TeamType";
import { useTranslation } from "react-i18next";
import { InfoTooltip } from "../../shared/popup/InfoTooltip";
import { useAppSelector } from "../../../AppRootContext";
import { StaffType } from "../../../types/StaffType";
import utilStyles from "../../shared/Utils.module.css";
import { htmlEscape } from "../../../lib/utility/htmlEscape";

export function MentionToggle(props: {
  messageAssignee: StaffType | undefined;
  setMessageAssignee: (item: StaffType | undefined) => void;
}) {
  const [settings, user] = useAppSelector((s) => [s.settings, s.user]);
  const { messageAssignee, setMessageAssignee } = props;

  const [searchQuery, setSearchQuery] = useState("");
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [buttonHovered, setButtonHovered] = useState(false);
  const [open, setOpen] = useState(false);

  const { teamsCollapsible, isCollapsed, toggleCollapse } = useCollapsibleTeams(
    {
      allTeams: settings.teamsSettings.teams,
      searchQuery: searchQuery,
      opened: open,
    }
  );

  const openDropdown = () => {
    setOpen(true);
  };

  const closeDropdown = () => {
    setOpen(false);
  };

  useCloseOnClickOutside({
    onClose: closeDropdown,
    wrapRef: wrapRef,
    isOpened: open,
  });

  const { t } = useTranslation();

  const assigneeDisplayName = messageAssignee
    ? staffDisplayName(messageAssignee)
    : "";
  const teamsVisible = teamsCollapsible
    .map<TeamType>(
      evolve({
        members: reject(
          (m: StaffType) =>
            m.userInfo.id === messageAssignee?.userInfo.id ||
            m.userInfo.id === user.id
        ),
      })
    )
    .filter((t) => t.members.length > 0);

  return (
    <div
      className={`assignee-suggest-group ${messageAssignee ? "assigned" : ""}`}
      ref={wrapRef}
    >
      <span
        className="hover-box"
        onMouseEnter={() => {
          setButtonHovered(true);
        }}
        onMouseLeave={() => {
          setButtonHovered(false);
        }}
      >
        {messageAssignee === undefined ? (
          <InfoTooltip
            children={t("chat.actions.mention.add")}
            placement={"top"}
            trigger={
              <Button onClick={openDropdown}>
                <i className={"ui icon mention-toggle-icon"} />
              </Button>
            }
          />
        ) : (
          <Button onClick={openDropdown}>
            <i className={"ui icon mention-toggle-icon"} />
            <span
              className={"name-label"}
              title={htmlEscape(assigneeDisplayName)}
            >
              {assigneeDisplayName}
            </span>
            <span
              className="remove"
              onClick={(event) => {
                event.stopPropagation();
                setMessageAssignee(undefined);
                setButtonHovered(false);
              }}
            >
              &times;
            </span>
          </Button>
        )}
      </span>
      <div
        className={`
        assignee-suggest 
        ${open ? "open" : "closed"} 
        ${utilStyles.noScrollX}
        ${utilStyles.noScrollY}
      `}
      >
        {teamsVisible.length && (
          <Dropdown open={open} upward fluid>
            <Dropdown.Menu className="no-scrollbars">
              {teamsVisible.map((team, idx) => {
                return (
                  <TeamCollapsible
                    team={team}
                    renderItem={(staff: StaffType, index) => {
                      return (
                        <div
                          className={"item item-single"}
                          onClick={() => {
                            setMessageAssignee(staff);
                            setOpen(false);
                          }}
                          key={index}
                        >
                          <StaffItemAvatar
                            staff={{
                              name: staffDisplayName(staff),
                              profilePicture: staff.profilePicture,
                              profilePictureURL: staff.profilePictureURL,
                              ...staff.userInfo,
                            }}
                          />
                          <span className={"item-name"}>
                            {staffDisplayName(staff)}
                          </span>
                          {messageAssignee &&
                            staff.userInfo.id ===
                              messageAssignee.userInfo.id && (
                              <Icon name="check" />
                            )}
                        </div>
                      );
                    }}
                    collapsed={searchQuery ? false : isCollapsed(team.id)}
                    toggle={toggleCollapse}
                    key={idx}
                  />
                );
              })}
            </Dropdown.Menu>
          </Dropdown>
        )}
        <Input
          type={"text"}
          icon={"search"}
          placeholder={t("chat.team.input.teamSearch.placeholder")}
          fluid
          value={searchQuery}
          onChange={(event, data) => {
            setSearchQuery(data.value as string);
          }}
        />
      </div>
    </div>
  );
}
