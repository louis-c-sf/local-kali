import React, { useCallback, useContext } from "react";
import { Checkbox, Table } from "semantic-ui-react";
import SettingStaffRow from "./SettingStaffRow";
import { useHistory } from "react-router-dom";
import { matchesStaff } from "../../../types/TeamType";
import { useTranslation } from "react-i18next";
import { useStaffRoles } from "../localizable/useStaffRoles";
import useRouteConfig from "../../../config/useRouteConfig";
import { useAccessRulesGuard } from "../hooks/useAccessRulesGuard";
import { useAppSelector } from "../../../AppRootContext";
import { StaffType } from "../../../types/StaffType";
import QrCodeIcon from "../../../assets/tsx/QrCodeIcon";
import { SettingUserContext } from "./hooks/SettingUserContext";
import { GridSelection } from "../../shared/grid/GridSelection";

interface SettingStaffTableProps {
  updateMenuItem: Function;
  staffList: StaffType[];
  loading: boolean;
}

const SettingStaffTable = (props: SettingStaffTableProps) => {
  const [user, settings] = useAppSelector((s) => [s.user, s.settings]);
  const { updateMenuItem, staffList, loading } = props;
  let history = useHistory();
  const accessGuard = useAccessRulesGuard();
  const { t } = useTranslation();
  const { routeTo } = useRouteConfig();
  const { staffRoleChoices } = useStaffRoles();
  const isQRCodeMappingEnabled = useAppSelector(
    (s) => s.company?.isQRCodeMappingEnabled
  );
  const staffFieldMapping = {
    id: "",
    name: t("settings.user.grid.table.header.user"),
    email: t("settings.user.grid.table.header.email"),
    teams: t("settings.user.grid.table.header.teams"),
    roleType: t("settings.user.grid.table.header.role"),
    position: t("settings.user.grid.table.header.position"),
    ...(isQRCodeMappingEnabled
      ? {
          qrCodeChannel: t("grid.table.header.qrCodeChannel"),
          download: (
            <>
              <QrCodeIcon className="qrCodeIcon" />
              {t("form.button.download")}
            </>
          ),
        }
      : {}),
    createdAt: t("settings.user.grid.table.header.created"),
  };
  const qrCodeInfo = useContext(SettingUserContext);

  const onClick = useCallback(
    (isLoggedInUser: boolean, isAdmin: boolean, staffId: string) => {
      if (isLoggedInUser) {
        updateMenuItem("generalinfo");
      } else if (isAdmin) {
        history.push(routeTo(`/settings/usermanagement/${staffId}`));
      }
    },
    []
  );

  return (
    <Table sortable basic={"very"}>
      <Table.Header>
        <Table.Row>
          {Object.keys(staffFieldMapping).map((staffField) => {
            if (staffField === "id") {
              return (
                <Table.HeaderCell
                  className={"checkbox"}
                  key={`field${staffField}`}
                >
                  <div className="checkbox-wrap">
                    <Checkbox
                      disabled={loading || staffList.length === 0}
                      checked={qrCodeInfo.state.checkableItems.allChecked}
                      onChange={(event, data) => {
                        if (data.checked) {
                          qrCodeInfo.dispatch({ type: "CHECKED_ALL" });
                        } else {
                          qrCodeInfo.dispatch({ type: "UNCHECKED_ALL" });
                        }
                      }}
                    />
                  </div>
                </Table.HeaderCell>
              );
            }
            return (
              <Table.HeaderCell key={`field${staffField}`}>
                <div className="field-header">
                  {staffFieldMapping[staffField]}
                </div>
              </Table.HeaderCell>
            );
          })}
        </Table.Row>
      </Table.Header>
      <GridSelection
        selectedItemsCount={qrCodeInfo.state.checkableItems.checkedIds.length}
        itemsSingular={t("settings.user.grid.table.header.single")}
        itemsPlural={t("settings.user.grid.table.header.plural")}
        deleteConfirmationRequested={false}
      />
      <Table.Body>
        {staffList.map((staff, index) => {
          const userTeams = settings.teamsSettings.teams.filter((team) => {
            return team.members.some(matchesStaff(staff));
          });

          return (
            <SettingStaffRow
              key={index}
              onClick={onClick}
              id={staff.userInfo.id}
              name={staff.userInfo.displayName || "-"}
              position={staff.position || "-"}
              createdAt={staff.userInfo.createdAt}
              isOwner={index === 0}
              isAccepted={staff.isAcceptedInvitation}
              isLoggedInUser={staff.userInfo.id === user.id}
              role={
                staffRoleChoices.find(
                  (staffRole) =>
                    staffRole.value.toLowerCase() ===
                    staff.roleType.toLowerCase()
                )?.text ?? "-"
              }
              email={staff.userInfo.email}
              isCurrentUserAdmin={
                accessGuard.isAdmin() ||
                userTeams.some((t) => accessGuard.canEditTheTeam(t))
              }
              teams={userTeams}
              staff={staff}
            />
          );
        })}
      </Table.Body>
    </Table>
  );
};

export default SettingStaffTable;
