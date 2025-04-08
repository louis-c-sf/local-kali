import { DeleteConfirmationAwareType } from "../../shared/grid/GridHeader";
import { Checkbox, Table } from "semantic-ui-react";
import { staffDisplayName } from "../../Chat/utils/staffDisplayName";
import React, { useContext, useState } from "react";
import {
  SettingTeamsAction,
  SettingTeamsState,
} from "../../../container/Settings/settingTeamsReducer";
import { TeamType } from "../../../types/TeamType";
import { useFlashMessageChannel } from "../../BannerMessage/flashBannerMessage";
import { useCurrentUtcOffset } from "../../Chat/hooks/useCurrentUtcOffset";
import moment from "moment";
import { NavLink } from "react-router-dom";
import { AccessRulesGuard, isTeamAdminRole } from "../helpers/AccessRulesGuard";
import { useTranslation } from "react-i18next";
import useRouteConfig from "../../../config/useRouteConfig";
import useCompanyChannels from "../../Chat/hooks/useCompanyChannels";
import { ChannelConfiguredType } from "../../Chat/Messenger/types";
import { GridSelection } from "../../shared/grid/GridSelection";
import { ChannelsIconList } from "../../shared/grid/ChannelsIconList";
import AssignmentDropDown from "../../AssignmentRules/AssignmentDropDown";
import { useAppSelector } from "../../../AppRootContext";
import QrCodeIcon from "../../../assets/tsx/QrCodeIcon";
import {
  QrCodeChannelActionType,
  QRCodeChannelsType,
} from "../types/SettingTypes";
import { WhatsappQrCodeContext } from "../hooks/WhatsappQrCodeContext";
import { handleUpdateAccumulatedChannel } from "../helpers/handleUpdateAccumulatedChannel";
import { handleSelectedDownload } from "../helpers/downloadQrCode";
import { useFetchWhatsappQrCode } from "../../../container/Settings/hooks/useFetchWhatsappQrCode";
import { DownloadCell } from "../component/DownloadCell";
import QrCodeChannelCell from "../component/QrCodeChannelCell";
import FilteredUnExistedDefaultChannels from "../helpers/FilteredUnExistedDefaultChannels";
import styles from "../Setting.module.css";
import { usePermission } from "component/shared/usePermission";
import { PERMISSION_KEY } from "types/Rbac/permission";

export function TeamsTable(
  props: {
    state: SettingTeamsState;
    dispatch: React.Dispatch<SettingTeamsAction>;
    teams: TeamType[];
    guard: AccessRulesGuard;
  } & DeleteConfirmationAwareType
) {
  const { state, dispatch, teams, guard } = props;
  const { itemsLoading } = state;
  const utcOffset = useCurrentUtcOffset();
  const companyChannels = useCompanyChannels();
  const { t } = useTranslation();

  return (
    <>
      <Table basic={"very"} className={"app data-grid"}>
        <TableHeader
          items={teams}
          itemsLoading={itemsLoading}
          dispatch={dispatch}
          state={state}
        />
        <GridSelection
          selectedItemsCount={state.checkableItems.checkedIds.length}
          itemsSingular={t("settings.teams.grid.header.single")}
          itemsPlural={t("settings.teams.grid.header.plural")}
          deleteConfirmationRequested={props.deleteConfirmationRequested}
        />
        <Table.Body>
          {teams.map((team, index) => {
            return (
              <TeamRow
                key={index}
                dispatch={dispatch}
                state={state}
                team={team}
                utcOffset={utcOffset}
                guard={guard}
                companyChannels={companyChannels}
              />
            );
          })}
        </Table.Body>
      </Table>
    </>
  );
}

export function TableHeader(props: {
  state: SettingTeamsState;
  dispatch: React.Dispatch<SettingTeamsAction>;
  itemsLoading: boolean;
  items: TeamType[];
}) {
  const { state, dispatch, itemsLoading, items } = props;
  const { t } = useTranslation();
  const isQRCodeMappingEnabled = useAppSelector(
    (s) => s.company?.isQRCodeMappingEnabled
  );

  return (
    <Table.Header>
      <Table.Row>
        <Table.HeaderCell className={"checkbox"}>
          <div className="checkbox-wrap">
            <Checkbox
              disabled={itemsLoading || items.length === 0}
              checked={state.checkableItems.allChecked}
              onChange={(event, data) => {
                if (data.checked) {
                  dispatch({ type: "CHECKED_ALL" });
                } else {
                  dispatch({ type: "UNCHECKED_ALL" });
                }
              }}
            />
          </div>
        </Table.HeaderCell>
        <Table.HeaderCell>
          {t("settings.teams.grid.header.name")}
        </Table.HeaderCell>
        <Table.HeaderCell>
          {t("settings.teams.grid.header.members")}
        </Table.HeaderCell>
        <Table.HeaderCell>
          {t("settings.teams.grid.header.admin")}
        </Table.HeaderCell>
        <Table.HeaderCell>
          {t("settings.teams.grid.header.defaultChannels")}
        </Table.HeaderCell>
        {isQRCodeMappingEnabled && (
          <>
            <Table.HeaderCell>
              {t("grid.table.header.qrCodeChannel")}
            </Table.HeaderCell>
            <Table.HeaderCell>
              {t("settings.teams.grid.header.assignTo")}
            </Table.HeaderCell>
            <Table.HeaderCell className="download">
              <QrCodeIcon className="qrCodeIcon" />
              {t("form.button.download")}
            </Table.HeaderCell>
          </>
        )}
        <Table.HeaderCell>
          {t("settings.teams.grid.header.updatedAt")}
        </Table.HeaderCell>
      </Table.Row>
    </Table.Header>
  );
}

function TeamRow(props: {
  team: TeamType;
  dispatch: React.Dispatch<SettingTeamsAction>;
  state: SettingTeamsState;
  utcOffset: number;
  guard: AccessRulesGuard;
  companyChannels: ChannelConfiguredType<any>[];
}) {
  const { team, dispatch, state, utcOffset, guard, companyChannels } = props;
  const qrCodeInfo = useContext(WhatsappQrCodeContext);
  const admins = props.team.teamAdmins.filter(isTeamAdminRole);
  const { t } = useTranslation();
  const { routeTo } = useRouteConfig();
  const flash = useFlashMessageChannel();
  const isQRCodeMappingEnabled = useAppSelector(
    (s) => s.company?.isQRCodeMappingEnabled
  );
  const { fetchQrCodeInfo } = useFetchWhatsappQrCode();
  const [selectedChannel, setSelectedChannel] =
    useState<QrCodeChannelActionType>({
      targetedChannelWithIds: team.qrCodeChannel
        ? [team.qrCodeChannel]
        : undefined,
    });
  const allDefaultChannels = FilteredUnExistedDefaultChannels(
    companyChannels,
    team.defaultChannels
  );
  const filteredDefaultChannels = allDefaultChannels.filter((row) =>
    row.channel.includes("whatsapp")
  );
  const hasQrCodeChannel =
    allDefaultChannels.length === 0 || filteredDefaultChannels.length > 0;
  const { check } = usePermission();

  const dispatchCallback = (channels: QRCodeChannelsType[]): void => {
    qrCodeInfo.dispatch({
      type: "UPDATE_CHANNELS",
      channels,
    });
  };

  const handleUpdateChannel = (currentChannel: QrCodeChannelActionType) => {
    setSelectedChannel(currentChannel);
    handleUpdateAccumulatedChannel({
      currentChannel,
      accumulatedChannels: qrCodeInfo.state.channels,
      row: team,
      onChannelsUpdated: dispatchCallback,
    });
  };

  const handleUpdateAssignment = (type: string, staff: string) => {
    const rest = qrCodeInfo.state.assignments?.filter(
      (assignment) => assignment.id !== team.id
    );
    qrCodeInfo.dispatch({
      type: "UPDATE_ASSIGNMENTS",
      assignments:
        (type !== "specificperson" &&
          type === team.qrCodeAssignmentType?.toLowerCase()) ||
        (type === "specificperson" && staff === team.qrCodeAssignmentStaffId)
          ? rest
          : [
              ...(rest ?? []),
              {
                id: team.id,
                assignmentType: type,
                staffId: staff,
              },
            ],
    });
  };

  const downloadClickResolve = () => {
    flash(
      t("settings.whatsappQrCode.common.flashMsg.download.teams", { count: 1 })
    );
  };

  return (
    <Table.Row className={styles.tableRow}>
      <Table.Cell className={"checkbox"}>
        <div className="checkbox-wrap">
          <Checkbox
            checked={state.checkableItems.checkedIds.includes(team.id)}
            onChange={(event, data) => {
              if (data.checked) {
                dispatch({ type: "CHECKED_ITEM", id: team.id });
              } else {
                dispatch({ type: "UNCHECKED_ITEM", id: team.id });
              }
            }}
          />
        </div>
      </Table.Cell>
      <Table.Cell>
        <div className="cell-wrap">
          <NavLink
            className={"text-color name"}
            to={routeTo(`/settings/teams/${team.id}`)}
            children={team.name}
          />
          <NavLink
            className={"ui button button-small edit-link"}
            to={routeTo(`/settings/teams/${team.id}`)}
            children={
              check(
                [PERMISSION_KEY.companySettingsTeamEdit],
                [guard.canEditTheTeam(team)]
              )[0]
                ? t("form.button.edit")
                : t("form.button.view")
            }
          />
        </div>
      </Table.Cell>
      <Table.Cell>{team.members.length}</Table.Cell>
      <Table.Cell>
        {admins
          ? admins.map((admin) => staffDisplayName(admin)).join(", ")
          : ""}
      </Table.Cell>
      <Table.Cell>
        <ChannelsIconList
          value={allDefaultChannels}
          channelsAvailable={companyChannels}
        />
      </Table.Cell>
      {isQRCodeMappingEnabled && (
        <>
          <Table.Cell className={styles.qrCodeChannel}>
            <QrCodeChannelCell
              defaultChannels={allDefaultChannels}
              selectedChannel={selectedChannel}
              handleUpdateChannel={handleUpdateChannel}
            />
          </Table.Cell>
          <Table.Cell className={styles.assignment}>
            {hasQrCodeChannel && (
              <AssignmentDropDown
                initAssignmentType={
                  team.qrCodeAssignmentType
                    ? team.qrCodeAssignmentType.toLowerCase()
                    : ""
                }
                initStaff={team.qrCodeAssignmentStaffId ?? ""}
                updateAssignmentValue={handleUpdateAssignment}
                hideTeamOption={true}
                initStaffList={state.initStaffList[team.id]}
              />
            )}
          </Table.Cell>
          <Table.Cell className={styles.singleDownload}>
            {hasQrCodeChannel && (
              <DownloadCell
                isEdit={
                  qrCodeInfo.state.isEdit &&
                  state.checkableItems.checkedIds.length === 0
                }
                handleSelectedDownload={() =>
                  handleSelectedDownload({
                    type: "teams",
                    checkedIds: [team.id],
                    fetchQrCodeInfo,
                    resolve: downloadClickResolve,
                  })
                }
              />
            )}
          </Table.Cell>
        </>
      )}
      <Table.Cell>
        {moment
          .utc(team.lastUpdatedAt)
          .utcOffset(utcOffset)
          .format("MM/DD/YYYY HH:mm")}
      </Table.Cell>
    </Table.Row>
  );
}
