import { Checkbox, Table } from "semantic-ui-react";
import { staffDisplayName } from "../../Chat/utils/staffDisplayName";
import React from "react";
import { useCurrentUtcOffset } from "../../Chat/hooks/useCurrentUtcOffset";
import moment from "moment";
import { NavLink } from "react-router-dom";
import {
  SettingTeamMembersAction,
  SettingTeamMembersState,
} from "../../../container/Settings/settingTeamMembersReducer";
import { UserType } from "../../../types/LoginType";
import { useTranslation } from "react-i18next";
import { useStaffRoles } from "../localizable/useStaffRoles";
import useRouteConfig from "../../../config/useRouteConfig";
import { GridSelection } from "../../shared/grid/GridSelection";
import { DeleteConfirmationAwareType } from "../../shared/grid/GridHeader";
import { StaffAvatar } from "../../shared/Avatar/StaffAvatar";
import { useAppSelector } from "../../../AppRootContext";
import { StaffType } from "../../../types/StaffType";
import { usePermission } from "component/shared/usePermission";
import { PERMISSION_KEY } from "types/Rbac/permission";
import { useAccessRulesGuard } from "../hooks/useAccessRulesGuard";

export function TeamMembersTable(
  props: {
    state: SettingTeamMembersState;
    dispatch: React.Dispatch<SettingTeamMembersAction>;
    members: StaffType[];
  } & DeleteConfirmationAwareType
) {
  const { state, dispatch, members } = props;
  const { itemsLoading } = state;
  const utcOffset = useCurrentUtcOffset();
  const user = useAppSelector((s) => s.user);
  const { t } = useTranslation();

  return (
    <>
      <TableHeader
        items={members}
        itemsLoading={itemsLoading}
        dispatch={dispatch}
        state={state}
      />
      <GridSelection
        selectedItemsCount={state.checkableItems.checkedIds.length}
        itemsSingular={t("settings.teams.grid.members.singular")}
        itemsPlural={t("settings.teams.grid.members.plural")}
        deleteConfirmationRequested={props.deleteConfirmationRequested}
      />
      <Table.Body>
        {members.map((team, index) => {
          return (
            <MemberRow
              user={user}
              key={index}
              dispatch={dispatch}
              state={state}
              member={team}
              utcOffset={utcOffset}
            />
          );
        })}
      </Table.Body>
    </>
  );
}

export function TableHeader(props: {
  state: SettingTeamMembersState;
  dispatch: React.Dispatch<SettingTeamMembersAction>;
  itemsLoading: boolean;
  items: StaffType[];
}) {
  const { state, dispatch, itemsLoading, items } = props;
  const { t } = useTranslation();

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
          {t("settings.team.grid.table.header.name")}
        </Table.HeaderCell>
        <Table.HeaderCell>
          {t("settings.team.grid.table.header.email")}
        </Table.HeaderCell>
        <Table.HeaderCell>
          {t("settings.team.grid.table.header.role")}
        </Table.HeaderCell>
        <Table.HeaderCell>
          {t("settings.team.grid.table.header.position")}
        </Table.HeaderCell>
        <Table.HeaderCell collapsing>
          {t("settings.team.grid.table.header.added")}
        </Table.HeaderCell>
      </Table.Row>
    </Table.Header>
  );
}

function MemberRow(props: {
  user: UserType;
  member: StaffType;
  dispatch: React.Dispatch<SettingTeamMembersAction>;
  state: SettingTeamMembersState;
  utcOffset: number;
}) {
  const { member, dispatch, state, utcOffset, user } = props;
  const { t } = useTranslation();
  const { staffRoleChoices } = useStaffRoles();
  const { routeTo } = useRouteConfig();
  const guard = useAccessRulesGuard();
  const { check } = usePermission();
  const editLink =
    user.id === member.userInfo.id
      ? routeTo("/settings/generalinfo")
      : routeTo(`/settings/usermanagement/${member.userInfo.id}`);
  return (
    <Table.Row>
      <Table.Cell className={"checkbox"}>
        <div className="checkbox-wrap">
          <Checkbox
            checked={state.checkableItems.checkedIds.includes(
              member.userInfo.id
            )}
            onChange={(event, data) => {
              if (data.checked) {
                dispatch({ type: "CHECKED_ITEM", id: member.userInfo.id });
              } else {
                dispatch({ type: "UNCHECKED_ITEM", id: member.userInfo.id });
              }
            }}
          />
        </div>
      </Table.Cell>
      <Table.Cell>
        {check(
          [PERMISSION_KEY.companySettingsUserEdit],
          [guard.canEditUser()]
        )[0] ? (
          <div className="cell-wrap">
            <NavLink className={"text-color name"} to={editLink}>
              <span className="avatar">
                <StaffAvatar staff={member} size={"24px"} />
              </span>
              {staffDisplayName(member)}
            </NavLink>
            <NavLink
              className={"ui button button-small edit-link"}
              to={editLink}
              children={t("form.button.edit")}
            />
          </div>
        ) : (
          <div className="cell-wrap">
            <div className={"text-color name"}>
              <span className="avatar">
                <StaffAvatar staff={member} size={"24px"} />
              </span>
              {staffDisplayName(member)}
            </div>
          </div>
        )}
      </Table.Cell>
      <Table.Cell>
        {member.userInfo.email ?? member.userInfo.phoneNumber}
      </Table.Cell>
      <Table.Cell>
        {
          staffRoleChoices.find(
            (staff) =>
              staff.value.toLowerCase() === member.roleType.toLowerCase()
          )?.text
        }
      </Table.Cell>
      <Table.Cell>{member.position}</Table.Cell>
      <Table.Cell collapsing>
        {moment
          .utc(member.userInfo.createdAt)
          .utcOffset(utcOffset)
          .format("MMM DD, YYYY HH:mm")}
      </Table.Cell>
    </Table.Row>
  );
}
