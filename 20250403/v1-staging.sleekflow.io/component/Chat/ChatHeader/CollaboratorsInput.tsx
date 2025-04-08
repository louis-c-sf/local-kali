import React, { ReactNode, useState, useCallback, useMemo } from "react";
import { getStaffId, matchesStaff, TeamType } from "../../../types/TeamType";
import { staffDisplayName } from "../utils/staffDisplayName";
import { useGetUserPicUrl } from "../../../api/User/useGetUserPicUrl";
import { submitAssignStaff } from "../../../api/Chat/submitAssignStaff";
import { Dropdown, Image, Input, Popup } from "semantic-ui-react";
import { AssignmentPopup } from "../AssignmentPopup";
import { useTeams } from "../../../container/Settings/useTeams";
import { TeamCollapsible, useCollapsibleTeams } from "../TeamCollapsible";
import { StaffItemAvatar } from "../StaffItemAvatar";
import { Trans, useTranslation } from "react-i18next";
import Avatar from "react-avatar";
import { denormalizeConversationCollaborators } from "../../../types/Chat/denormalizeConversationCollaborators";
import { InfoTooltip } from "../../shared/popup/InfoTooltip";
import { StaffAvatar } from "../../shared/Avatar/StaffAvatar";
import { UserInfoType } from "../../../types/ConversationType";
import { useFlashMessageChannel } from "../../BannerMessage/flashBannerMessage";
import { useAppDispatch, useAppSelector } from "../../../AppRootContext";
import styles from "./CollaboratorsInput.module.css";
import CloseIconCircle from "../../../assets/tsx/icons/CloseIconCircle";
import { useHoveredFlag } from "../hooks/useHoveredFlag";
import { StaffType } from "../../../types/StaffType";
import { equals } from "ramda";
import { htmlEscape } from "../../../lib/utility/htmlEscape";

const MAX_COLLABORATORS = 5;

const ASSIGNMENT_POPUP_OFFSET = [0, 12] as [number, number];

function CollaboratorsInput(props: {
  conversationAssigneeId?: string;
  collaboratorIds: string[];
}) {
  const [staffList, profile] = useAppSelector(
    (s) => [s.staffList, s.profile],
    equals
  );
  const loginDispatch = useAppDispatch();
  const { t } = useTranslation();
  const flash = useFlashMessageChannel();

  const { collaboratorIds, conversationAssigneeId } = props;
  const collaborators = collaboratorIds.reduce<UserInfoType[]>(
    (acc, collaboratorId) => {
      let user = staffList.find(
        (a) => a?.userInfo?.id === collaboratorId
      )?.userInfo;
      if (user !== undefined && !acc.some((c) => c.id === user!.id)) {
        return [...acc, user];
      }
      return acc;
    },
    []
  );
  const { teams } = useTeams();

  const collaboratorsVisible = collaborators
    .filter((c) => c.id !== conversationAssigneeId)
    .slice(0, MAX_COLLABORATORS);
  const collaboratorsAvailable = staffList.filter(
    (c) =>
      getStaffId(c) !== conversationAssigneeId &&
      !collaborators.some((u) => u.id === c.userInfo.id)
  );
  const [buttonRef, setButtonRef] = useState<HTMLElement | null>(null);
  const [assignOpened, setAssignOpened] = useState(false);

  const teamsAvailable = useMemo(
    () =>
      teams.reduce<TeamType[]>((prev, next) => {
        const membersAvailable = next.members
          .filter((m) => !collaboratorIds.some((c) => c === getStaffId(m)))
          .filter((m) => getStaffId(m) !== conversationAssigneeId);
        if (membersAvailable.length > 0) {
          return [...prev, { ...next, members: membersAvailable }];
        }
        return prev;
      }, []),
    [JSON.stringify(collaboratorIds), teams]
  );

  let profileTeamId: number | undefined = undefined;
  if (conversationAssigneeId && profile?.assignedTeam?.id) {
    profileTeamId = teams.some(
      (team) =>
        team.id === profile?.assignedTeam?.id &&
        team.members.some((m) => getStaffId(m) === conversationAssigneeId)
    )
      ? profile?.assignedTeam?.id
      : undefined;
  }

  const addCollaborator = useCallback(
    async (userId: string) => {
      const updatedIds = [...collaboratorIds, userId];
      try {
        const result = await submitAssignStaff(
          profile.conversationId,
          conversationAssigneeId,
          profileTeamId,
          undefined,
          updatedIds
        );
        loginDispatch({
          type: "ASSIGNEE_COLLABORATORS_UPDATED",
          profile: {
            ...profile,
            collaboratorIds: denormalizeConversationCollaborators(result),
          },
        });
      } catch (e) {
        console.error(e);
      }
    },
    [
      JSON.stringify(profile),
      conversationAssigneeId,
      profileTeamId,
      collaboratorIds.join(),
    ]
  );

  async function removeCollaborator(staff: StaffType) {
    try {
      const result = await submitAssignStaff(
        profile.conversationId,
        conversationAssigneeId,
        profileTeamId,
        undefined,
        collaboratorIds.filter((id) => staff.userInfo.id !== id)
      );

      loginDispatch({
        type: "ASSIGNEE_COLLABORATORS_UPDATED",
        profile: {
          ...profile,
          collaboratorIds: denormalizeConversationCollaborators(result),
        },
      });
    } catch (e) {
      console.error(e);
    }
  }

  const canAddCollaborators = collaboratorsVisible.length < MAX_COLLABORATORS;

  const closeAssignmentMenu = useCallback(
    () => setAssignOpened(false),
    [setAssignOpened]
  );

  return (
    <div className={styles.input}>
      {collaboratorsVisible.length > 0 && (
        <div className={styles.list}>
          {collaboratorsVisible.map((u) => (
            <CollaboratorItem
              key={u.id}
              staff={staffList.find((s) => getStaffId(s) === u.id)!}
              removeItem={removeCollaborator}
            />
          ))}
        </div>
      )}
      {collaboratorsAvailable.length > 0 && (
        <div
          className={styles.buttonWrap}
          onClick={() => setAssignOpened((o) => !o)}
          ref={setButtonRef}
        >
          {canAddCollaborators ? (
            <InfoTooltip
              trigger={
                <span className={styles.button}>
                  <i className={"ui icon icon-add-collaborator"} />
                </span>
              }
              placement={"bottom"}
            >
              <Trans i18nKey={"chat.header.collaborators.tooltip.add"}>
                <div className={"tooltip-title"}>Add Collaborator</div>
                Collaborator will have receive notifications and have access to
                this conversation.
              </Trans>
            </InfoTooltip>
          ) : (
            <InfoTooltip
              trigger={
                <span
                  className={"ui label mini-button disabled"}
                  onClick={() => {
                    flash(
                      t("chat.header.collaborators.tooltip.disabled", {
                        count: MAX_COLLABORATORS,
                      })
                    );
                  }}
                >
                  <i className={"ui icon icon-add-collaborator"} />
                </span>
              }
              placement={"bottom"}
            >
              <Trans
                i18nKey={"chat.header.collaborators.tooltip.disabled"}
                count={MAX_COLLABORATORS}
              >
                You cannot assign more than [count] collaborators
              </Trans>
            </InfoTooltip>
          )}

          <AssignmentPopup
            opened={assignOpened && canAddCollaborators}
            setOpened={setAssignOpened}
            anchorNode={buttonRef}
            offset={ASSIGNMENT_POPUP_OFFSET}
            placement={"bottom-start"}
          >
            <AssignmentMenu
              teamsAvailable={teamsAvailable}
              opened={assignOpened}
              close={closeAssignmentMenu}
              collaboratorIds={collaboratorIds}
              conversationAssigneeId={conversationAssigneeId}
              onCollaboratorAdd={addCollaborator}
            />
          </AssignmentPopup>
        </div>
      )}
    </div>
  );
}

function AssignmentMenu(props: {
  teamsAvailable: TeamType[];
  opened: boolean;
  collaboratorIds: string[];
  conversationAssigneeId: string | undefined;
  onCollaboratorAdd: (id: string) => void;
  close: () => void;
}) {
  const [searchText, setSearchText] = useState("");

  const { isCollapsed, teamsCollapsible, toggleCollapse } = useCollapsibleTeams(
    {
      allTeams: [...props.teamsAvailable],
      searchQuery: searchText,
      opened: props.opened,
      isUserVisible: (u) =>
        ![...props.collaboratorIds, props.conversationAssigneeId].includes(
          u.userInfo.id
        ),
    }
  );

  const { t } = useTranslation();

  const renderStaff = (staff: StaffType) => (
    <div
      className={"item search-staff"}
      onClick={() => {
        props.onCollaboratorAdd(getStaffId(staff));
        props.close();
      }}
      key={getStaffId(staff)}
    >
      <div className="staff">
        <StaffItemAvatar
          staff={{
            name: staffDisplayName(staff),
            profilePicture: staff.profilePicture,
            profilePictureURL: staff.profilePictureURL,
            ...staff.userInfo,
          }}
        />
        <div className="info">
          <div className="name">{staffDisplayName(staff)}</div>
        </div>
      </div>
    </div>
  );

  return (
    <Dropdown.Menu>
      <Input
        icon="search"
        fluid
        iconPosition="left"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        value={searchText}
        onChange={(e) => {
          setSearchText(e.target.value);
        }}
        placeholder={t("chat.form.input.search.placeholder")}
      />
      <Dropdown.Menu scrolling className={"team-list"}>
        {teamsCollapsible.map((team) => {
          return (
            <TeamCollapsible
              key={team.id}
              team={team}
              collapsed={searchText.length > 0 ? false : isCollapsed(team.id)}
              toggle={toggleCollapse}
              renderItem={renderStaff}
            />
          );
        })}
      </Dropdown.Menu>
    </Dropdown.Menu>
  );
}

export function CollaboratorItem(props: {
  removeItem?: (staff: StaffType) => void;
  staff: StaffType;
}) {
  const { removeItem, staff } = props;
  const { teams } = useTeams();
  const { hovered, ...hoverProps } = useHoveredFlag();

  const teamsList = teams.reduce<TeamType[]>((acc, next) => {
    if (staff && next.members.some(matchesStaff(staff))) {
      return [...acc, next];
    }
    return acc;
  }, []);

  const userPicUrl = useGetUserPicUrl(staff);
  return (
    <StaffPopup
      staff={staff}
      teams={teamsList}
      trigger={
        <div className={`${styles.user}`} {...hoverProps}>
          <div className={styles.pic}>
            {userPicUrl ? (
              <Image
                src={userPicUrl}
                alt={htmlEscape(staffDisplayName(staff))}
              />
            ) : (
              <Avatar
                name={staffDisplayName(staff) ?? staff.userInfo.id}
                round={true}
                maxInitials={2}
              />
            )}
          </div>
          {removeItem && (
            <div className={styles.close} onClick={() => removeItem(staff)}>
              <CloseIconCircle hovered={hovered} />
            </div>
          )}
        </div>
      }
    />
  );
}

function StaffPopup(props: {
  staff: StaffType;
  teams: TeamType[];
  trigger: ReactNode;
}) {
  const { t } = useTranslation();

  return (
    <Popup
      className={"user-card dialog compact"}
      trigger={props.trigger}
      on={"hover"}
      mountNode={document.body}
      offset={"-5,0"}
    >
      <header>{t("chat.header.collaborators.popup.head")}</header>
      <div className="details">
        <div className="pic">
          <StaffAvatar staff={props.staff} size={"32px"} />
        </div>
        <div className="personal">
          <div className="name">{staffDisplayName(props.staff)}</div>
          {props.teams.length > 0 && (
            <div className="teams">
              {props.teams.map((t) => t.name).join(" / ")}
            </div>
          )}
        </div>
      </div>
    </Popup>
  );
}

export default CollaboratorsInput;
