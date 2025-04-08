import React, { useEffect, useMemo, useReducer, useState } from "react";
import {
  defaultState,
  settingTeamsReducer,
} from "../../../container/Settings/settingTeamsReducer";
import { useFlashMessageChannel } from "../../BannerMessage/flashBannerMessage";
import { TeamNormalizedType } from "../../../types/TeamType";
import {
  deleteMethodWithExceptions,
  getWithExceptions,
  postWithExceptions,
} from "../../../api/apiRequest";
import {
  DELETE_TEAMS,
  GET_TEAM,
  POST_TEAM_QRCODE,
  POST_TEAMS_ADD_USER,
  POST_TEAMS_CREATE,
} from "../../../api/apiPath";
import GridHeader from "../../shared/grid/GridHeader";
import { Table } from "semantic-ui-react";
import GridDummy from "../../shared/Placeholder/GridDummy";
import { TableHeader, TeamsTable } from "./TeamsTable";
import { pick, prop } from "ramda";
import Helmet from "react-helmet";
import { AccessPopup } from "./ManageTeamMembers";
import { useAccessRulesGuard } from "../hooks/useAccessRulesGuard";
import { EditTeamDialog, EditTeamFormType } from "./EditTeamDialog";
import { AddTeamMembersDialog } from "./AddTeamMembersDialog";
import { useTranslation } from "react-i18next";
import { useTeams } from "../../../container/Settings/useTeams";
import { isTeamAdminRole } from "../helpers/AccessRulesGuard";
import { useAppSelector } from "../../../AppRootContext";
import { useFetchWhatsappQrCode } from "../../../container/Settings/hooks/useFetchWhatsappQrCode";
import {
  defaultState as whatsAppQrCodeInfoDefaultState,
  whatsappQrCodeInfoReducer,
} from "../hooks/whatsappQrCodeReducer";
import { WhatsappQrCodeContext } from "../hooks/WhatsappQrCodeContext";
import { formatQrCodeInfoRequestParam } from "../helpers/formatQrCodeInfoRequestParam";
import { handleSelectedDownload } from "../helpers/downloadQrCode";
import { RequestParamType } from "../types/SettingTypes";
import HeaderPrependActions from "../component/HeaderPrependActions";
import { usePermission } from "component/shared/usePermission";
import { PERMISSION_KEY } from "types/Rbac/permission";

export function ManageTeams() {
  const [state, dispatch] = useReducer(settingTeamsReducer, defaultState());
  const flash = useFlashMessageChannel();
  const { settings, staffList, loggedInUserDetail } = useAppSelector(
    pick(["settings", "loggedInUserDetail", "staffList"])
  );
  const isQRCodeMappingEnabled = useAppSelector(
    (s) => s.company?.isQRCodeMappingEnabled
  );

  const [deleteConfirmationRequested, setDeleteConfirmationRequested] =
    useState(false);
  const { refreshTeams } = useTeams();

  const accessRulesGuard = useAccessRulesGuard();
  const teams =
    loggedInUserDetail && isTeamAdminRole(loggedInUserDetail)
      ? settings.teamsSettings.teams.filter((t) =>
          accessRulesGuard.canEditTheTeam(t)
        )
      : settings.teamsSettings.teams;
  const { fetchQrCodeInfo } = useFetchWhatsappQrCode();
  const guard = useAccessRulesGuard();
  const { t } = useTranslation();
  const { check } = usePermission();
  const [canCreateTeam, canDeleteTeam] = useMemo(
    () =>
      check(
        [
          PERMISSION_KEY.companySettingsTeamCreate,
          PERMISSION_KEY.companySettingsTeamDelete,
        ],
        [guard.canEditAnyTeam(), guard.canEditAnyTeam()]
      ),
    [check, guard]
  );

  useEffect(() => {
    refreshItems();
  }, []);

  async function refreshItems() {
    dispatch({ type: "ITEMS_LOAD_START" });
    try {
      const teams = await refreshTeams();
      dispatch({
        type: "CHECKABLE_IDS_UPDATED",
        newIdList: teams.map(prop("id")),
      });
    } catch (e) {
      console.error("refreshItems", e);
    } finally {
      dispatch({ type: "ITEMS_LOAD_COMPLETE" });
    }
  }

  async function deleteItems(idList: number[]) {
    try {
      dispatch({ type: "DELETE_START" });
      await deleteMethodWithExceptions(DELETE_TEAMS, {
        param: { teamIds: idList },
      });
      dispatch({ type: "DELETE_COMPLETE" });
      refreshItems();
    } catch (e) {
      dispatch({ type: "DELETE_COMPLETE" });
      console.error("deleteItems", e, idList);
      flash(t("system.error.unknown"));
    }
  }

  async function createClickHandler(values: EditTeamFormType) {
    dispatch({ type: "SAVE_TEAM_START" });
    try {
      const result: TeamNormalizedType = await postWithExceptions(
        POST_TEAMS_CREATE,
        {
          param: {
            TeamName: values.name,
            DefaultChannels: values.defaultChannels,
          },
        }
      );
      flash(t("flash.team.created"));
      dispatch({ type: "SAVE_TEAM_COMPLETE", teamId: result.id });

      return await refreshItems();
    } catch (e) {
      console.error("createClickHandler", values, e);
      dispatch({ type: "SAVE_TEAM_ERROR" });
    }
  }

  async function addMembersHandler(staffIds: string[]) {
    if (typeof state.editTeamId !== "number") {
      console.error("addMembersHandler: Unexpected call");
      return;
    }
    dispatch({ type: "SAVE_MEMBERS_START" });
    try {
      await postWithExceptions(
        POST_TEAMS_ADD_USER.replace("{id}", String(state.editTeamId)),
        {
          param: {
            StaffIds: staffIds,
          },
        }
      );
      flash(t("flash.team.memberAdded", { count: staffIds.length }));
      dispatch({ type: "SAVE_MEMBERS_COMPLETE" });
      return await refreshItems();
    } catch (e) {
      console.error("addMembersHandler", staffIds, e);
      dispatch({ type: "SAVE_MEMBERS_ERROR" });
    }
  }

  const teamEdited = teams.find((t) => t.id === state.editTeamId);

  const createButtonLoading = state.itemsLoading || state.editMode === "create";
  const createButtonsDisabled = createButtonLoading || !canCreateTeam;
  const pageTitle = t("nav.menu.settings.teams");
  const [qrCodeInfoState, dispatchQrCodeInfo] = useReducer(
    whatsappQrCodeInfoReducer,
    whatsAppQrCodeInfoDefaultState()
  );

  const saveTeamQRCodeInfo = async (
    teamId: string,
    param: RequestParamType
  ) => {
    try {
      return await postWithExceptions(
        POST_TEAM_QRCODE.replace("{teamId}", teamId),
        {
          param,
        }
      );
    } catch (e) {
      console.error("POST_TEAM_QRCODE e: ", e);
    }
  };

  const handleClickSave = async () => {
    const requestParam = formatQrCodeInfoRequestParam({
      assignments: qrCodeInfoState.assignments ?? [],
      channels: qrCodeInfoState.channels,
      type: "teams",
    });
    try {
      dispatchQrCodeInfo({ type: "START_BUTTON_LOADING" });
      await Promise.all(
        requestParam.map((param) => {
          const { teamId, ...restParams } = param;
          saveTeamQRCodeInfo(teamId, restParams);
        })
      );
      flash(t("settings.whatsappQrCode.common.flashMsg.save.teams"));
      await refreshItems();
      dispatchQrCodeInfo({ type: "UPDATE_ASSIGNMENTS", assignments: [] });
      dispatchQrCodeInfo({ type: "UPDATE_CHANNELS", channels: [] });
    } catch (e) {
      console.error("update team error: ", e);
    } finally {
      dispatchQrCodeInfo({ type: "END_BUTTON_LOADING" });
    }
  };

  const selectedDownloadResolve = () => {
    flash(
      t("settings.whatsappQrCode.common.flashMsg.download.teams", {
        count: state.checkableItems.checkedIds.length,
      })
    );
    dispatch({ type: "UNCHECKED_ALL" });
  };

  const getTeamMember = async (teamId: number) => {
    try {
      return await getWithExceptions(
        GET_TEAM.replace("{teamId}", teamId.toString()),
        { param: {} }
      );
    } catch (e) {
      console.error("getTeamMember e: ", e);
    }
  };

  useEffect(() => {
    dispatch({
      type: "ITEMS_LOAD_START",
    });
    Promise.all(teams.map((team) => getTeamMember(team.id)))
      .then((res) => {
        const staffList = {};
        res.forEach((team) => {
          staffList[team.id] = team.members;
        });
        dispatch({
          type: "UPDATE_INIT_STAFF_LIST",
          initStaffList: staffList,
        });
      })
      .catch((error) => {
        console.error("GET_TEAM", error);
      })
      .finally(() => {
        dispatch({
          type: "ITEMS_LOAD_COMPLETE",
        });
      });
  }, []);

  useEffect(() => {
    if (
      qrCodeInfoState.assignments?.length !== 0 ||
      qrCodeInfoState.channels.length !== 0
    ) {
      dispatchQrCodeInfo({ type: "ENABLE_SAVE" });
    } else {
      dispatchQrCodeInfo({ type: "DISABLE_SAVE" });
    }
  }, [qrCodeInfoState.assignments, qrCodeInfoState.channels]);

  return (
    <WhatsappQrCodeContext.Provider
      value={{
        state: qrCodeInfoState,
        dispatch: dispatchQrCodeInfo,
      }}
    >
      <Helmet title={t("nav.common.title", { page: pageTitle })} />
      <GridHeader
        canDelete={canDeleteTeam}
        deleteLoading={state.deleteLoading}
        deleteConfirmationRequested={deleteConfirmationRequested}
        requestDeleteConfirmation={setDeleteConfirmationRequested}
        onDeleteClick={() => {
          deleteItems([...state.checkableItems.checkedIds]);
        }}
        selectedItemsCount={state.checkableItems.checkedIds.length}
        title={t("settings.teams.title")}
        prependActions={
          <HeaderPrependActions
            selectedItemsCount={state.checkableItems.checkedIds.length}
            optionChanged={qrCodeInfoState.isEdit}
            handleClickSave={handleClickSave}
            isLoading={qrCodeInfoState.buttonLoading}
            handleSelectedDownload={() =>
              handleSelectedDownload({
                type: "teams",
                checkedIds: state.checkableItems.checkedIds,
                fetchQrCodeInfo,
                resolve: selectedDownloadResolve,
              })
            }
            hasSaveButton={isQRCodeMappingEnabled ?? false}
            hasDownloadButton={isQRCodeMappingEnabled ?? false}
          />
        }
      >
        <AccessPopup editAccess={canCreateTeam}>
          <span
            className={`ui button primary ${
              createButtonsDisabled ? "off" : ""
            }`}
            onClick={
              createButtonsDisabled
                ? undefined
                : () => {
                    dispatch({ type: "CREATE_START" });
                  }
            }
            children={t("settings.teams.button.add")}
          />
        </AccessPopup>
      </GridHeader>

      {state.itemsLoading ? (
        <Table basic={"very"} sortable className={"app data-grid"}>
          <GridDummy
            loading={true}
            columnsNumber={8}
            hasCheckbox
            rowSteps={5}
            renderHeader={() => (
              <TableHeader
                state={state}
                dispatch={dispatch}
                itemsLoading={true}
                items={[]}
              />
            )}
          />
        </Table>
      ) : (
        <div className="hide-scrollable-table">
          <div className="stick-wrap">
            <TeamsTable
              teams={teams}
              state={state}
              dispatch={dispatch}
              guard={guard}
              deleteConfirmationRequested={deleteConfirmationRequested}
            />
          </div>
        </div>
      )}
      {state.editMode === "create" && (
        <EditTeamDialog
          title={t("settings.teams.modal.edit.header")}
          subTitle={t("settings.teams.modal.edit.subheader")}
          team={{
            members: [],
            teamAdmins: [],
            name: "",
            id: -1,
            lastUpdatedAt: "",
            defaultChannels: [],
          }}
          onSave={createClickHandler}
          onCancel={() => {
            dispatch({ type: "CREATE_CANCEL" });
          }}
        />
      )}
      {state.editMode === "post-create" && teamEdited && (
        <AddTeamMembersDialog
          cancelText={t("settings.teams.modal.add.button.cancel")}
          staff={staffList}
          loading={state.formLoading}
          team={teamEdited}
          onCancel={() => {
            dispatch({ type: "CREATE_CANCEL" });
          }}
          onConfirm={(staffIds: string[]) => {
            addMembersHandler(staffIds);
          }}
        />
      )}
    </WhatsappQrCodeContext.Provider>
  );
}
