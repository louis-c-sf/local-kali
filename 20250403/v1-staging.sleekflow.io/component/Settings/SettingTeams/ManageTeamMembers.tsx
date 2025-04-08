import React, { ReactNode, useEffect, useReducer, useState } from "react";
import { Popup, Table } from "semantic-ui-react";
import GridHeader from "../../shared/grid/GridHeader";
import { removeMember } from "../../../container/Settings/SettingTeams";
import {
  defaultState,
  SettingTeamMembersAction,
  settingTeamMembersReducer,
  SettingTeamMembersState,
} from "../../../container/Settings/settingTeamMembersReducer";
import { useFlashMessageChannel } from "../../BannerMessage/flashBannerMessage";
import GridDummy from "../../shared/Placeholder/GridDummy";
import { TableHeader, TeamMembersTable } from "./TeamMembersTable";
import { getStaffId, matchesStaff, TeamType } from "../../../types/TeamType";
import { propEq } from "ramda";
import { Redirect } from "react-router";
import { postWithExceptions } from "../../../api/apiRequest";
import { POST_TEAMS_ADD_USER } from "../../../api/apiPath";
import Helmet from "react-helmet";
import {
  EditTeamDialog,
  EditTeamFormType,
  sendUpdateTeam,
} from "./EditTeamDialog";
import { useAccessRulesGuard } from "../hooks/useAccessRulesGuard";
import { AccessRulesGuard } from "../helpers/AccessRulesGuard";
import { AddTeamMembersDialog } from "./AddTeamMembersDialog";
import { useTranslation } from "react-i18next";
import { useTeams } from "../../../container/Settings/useTeams";
import { useAppSelector } from "../../../AppRootContext";
import { BackNavLink } from "../../shared/nav/BackNavLink";
import { usePermission } from "component/shared/usePermission";
import { PERMISSION_KEY } from "types/Rbac/permission";

export function ManageTeamMembers(
  props: Readonly<{
    teamId: string;
  }>
) {
  const { teamId } = props;
  const [state, dispatch] = useReducer<
    React.Reducer<SettingTeamMembersState, SettingTeamMembersAction>
  >(settingTeamMembersReducer, defaultState());
  const flash = useFlashMessageChannel();
  const staffList = useAppSelector((s) => s.staffList);

  const [teamFound, setTeamFound] = useState<null | TeamType>();
  const [deleteConfirmationRequested, setDeleteConfirmationRequested] =
    useState(false);
  const guard = useAccessRulesGuard();

  const teamIdParsed = parseInt(teamId);
  const { t } = useTranslation();
  const { refreshTeams } = useTeams();
  const { check } = usePermission();

  useEffect(() => {
    dispatch({ type: "ITEMS_LOAD_START" });
    refreshTeam();
  }, []);

  async function refreshTeam() {
    try {
      const results = await refreshTeams();
      let teamFetched: null | TeamType = null;

      if (!isNaN(teamIdParsed)) {
        const team = results.find(propEq("id", teamIdParsed));
        if (team) {
          teamFetched = team;
          dispatch({
            type: "CHECKABLE_IDS_UPDATED",
            newIdList: team.members.map(getStaffId),
          });
        }
      }
      setTeamFound(teamFetched);
    } catch (error) {
      console.error("refreshTeam", error);
    } finally {
      dispatch({ type: "ITEMS_LOAD_COMPLETE" });
    }
  }

  // handle 404
  if (teamFound === null) {
    return <Redirect to={"/settings/groups"} />;
  }

  async function deleteMemberHandler(staffId: string[]) {
    await removeMember(teamId, staffId);
    flash(t("flash.settings.members.removed", { count: staffId.length }));
    refreshTeam();
  }

  async function addMembersHandler(staffIds: string[]) {
    dispatch({ type: "ADD_MEMBERS_START" });
    try {
      await postWithExceptions(POST_TEAMS_ADD_USER.replace("{id}", teamId), {
        param: {
          StaffIds: staffIds,
        },
      });
      flash(t("flash.settings.members.added", { count: staffIds.length }));
      dispatch({ type: "ADD_MEMBERS_COMPLETE" });
      return await refreshTeam();
    } catch (e) {
      console.error("addMembersHandler", staffIds, e);
      dispatch({ type: "ADD_MEMBERS_COMPLETE" });
    }
  }

  async function save(id: number, values: EditTeamFormType) {
    try {
      return await sendUpdateTeam(id, values);
    } catch (e) {
      console.error("ManageTeamMembers.save", e);
    }
  }

  const teamsTitle = t("nav.menu.settings.teams");
  const pageTitleBase = t("nav.common.title", { page: teamsTitle });
  const pageTitle = teamFound
    ? `${teamFound.name} | ${pageTitleBase}`
    : pageTitleBase;

  return (
    <>
      <Helmet title={pageTitle} />

      <GridHeader
        canDelete={
          teamFound
            ? check(
                [PERMISSION_KEY.companySettingsTeamEdit],
                [guard.canEditTheTeam(teamFound)]
              )[0]
            : false
        }
        deleteConfirmationRequested={deleteConfirmationRequested}
        requestDeleteConfirmation={setDeleteConfirmationRequested}
        deleteLoading={state.deleteLoading}
        onDeleteClick={() => {
          deleteMemberHandler([...state.checkableItems.checkedIds]);
        }}
        selectedItemsCount={state.checkableItems.checkedIds.length}
        title={
          <div className={"title-section"}>
            <BackNavLink to={"/settings/teams"}>
              {t("nav.backShort")}
            </BackNavLink>
            <div className="title">{teamFound?.name}</div>
          </div>
        }
      >
        <EditButtons
          onEditClick={() => {
            dispatch({ type: "EDIT_TEAM_CLICK" });
          }}
          state={state}
          onAddClick={() => {
            dispatch({ type: "ADD_MEMBERS_CLICK" });
          }}
          teamFound={teamFound}
          guard={guard}
        />
      </GridHeader>

      <Table basic={"very"} className={"app data-grid"}>
        {teamFound === undefined || state.itemsLoading ? (
          <GridDummy
            loading
            columnsNumber={5}
            hasCheckbox
            renderHeader={() => (
              <TableHeader
                itemsLoading
                state={state}
                dispatch={dispatch}
                items={[]}
              />
            )}
          />
        ) : (
          <TeamMembersTable
            state={state}
            dispatch={dispatch}
            deleteConfirmationRequested={deleteConfirmationRequested}
            members={teamFound.members.map(
              (m) => staffList.find(matchesStaff(m)) ?? m
            )}
          />
        )}
      </Table>
      {state.showForm && teamFound && (
        <AddTeamMembersDialog
          loading={state.formLoading}
          onConfirm={addMembersHandler}
          onCancel={() => {
            dispatch({ type: "ADD_MEMBERS_CANCEL" });
          }}
          staff={staffList}
          team={teamFound}
          cancelText={t("form.button.cancel")}
        />
      )}
      {state.teamsEditForm.show && teamFound && (
        <EditTeamDialog
          title={t("settings.team.modal.edit.header")}
          subTitle={t("settings.team.modal.edit.subheader")}
          team={teamFound}
          onSave={async (value) => {
            await save(teamFound?.id, value);
            dispatch({ type: "EDIT_TEAM_COMPLETE" });
            refreshTeam();
          }}
          onCancel={() => {
            dispatch({ type: "EDIT_TEAM_CANCEL" });
          }}
        />
      )}
    </>
  );
}

function EditButtons(props: {
  onEditClick: () => void;
  state: SettingTeamMembersState;
  onAddClick: () => void;
  guard: AccessRulesGuard;
  teamFound: TeamType | undefined;
}) {
  const { onEditClick, onAddClick, state, teamFound, guard } = props;
  const { check } = usePermission();
  const editAccess = teamFound
    ? check(
        [PERMISSION_KEY.companySettingsTeamEdit],
        [guard.canEditTheTeam(teamFound)]
      )[0]
    : false;
  const busy = state.itemsLoading || state.showForm;
  const { t } = useTranslation();

  const buttonsDisabled = !(editAccess && !busy);
  return (
    <div className={"buttons-group"}>
      <AccessPopup editAccess={editAccess}>
        <span
          className={`ui button button-small ${buttonsDisabled ? "off" : ""}`}
          children={t("form.button.edit")}
          onClick={buttonsDisabled ? undefined : onEditClick}
        />
      </AccessPopup>
      <AccessPopup editAccess={editAccess}>
        <span
          className={`ui primary button button-small ${
            buttonsDisabled ? "off" : ""
          }`}
          children={t("settings.team.button.add")}
          onClick={buttonsDisabled ? undefined : onAddClick}
        />
      </AccessPopup>
    </div>
  );
}

export function AccessPopup(props: {
  children: ReactNode;
  editAccess: boolean;
}) {
  const { t } = useTranslation();
  return (
    <Popup
      trigger={props.children}
      disabled={props.editAccess}
      position={"bottom right"}
      on={"hover"}
    >
      {t("settings.teams.message.noEditPermission")}
    </Popup>
  );
}
