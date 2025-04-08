import { matchesStaffId, TeamType } from "../../../types/TeamType";
import React, { useState } from "react";
import { differenceWith, eqBy, path, remove } from "ramda";
import { ModalForm } from "../../shared/ModalForm";
import { Dropdown, Form, Icon, Label } from "semantic-ui-react";
import { staffDisplayName } from "../../Chat/utils/staffDisplayName";
import { getQueryMatcher } from "../../../container/Settings/filters/getQueryMatcher";
import { useTranslation } from "react-i18next";
import { StaffAvatar } from "../../shared/Avatar/StaffAvatar";
import { StaffType } from "../../../types/StaffType";

export const staffMatcher = getQueryMatcher((staff: StaffType) => {
  return [
    staff.userInfo.displayName,
    staff.userInfo.firstName,
    staff.userInfo.lastName,
    staff.userInfo.email,
  ].join("");
});

export function AddTeamMembersDialog(props: {
  loading: boolean;
  onConfirm: (staffIds: string[]) => void;
  onCancel: () => void;
  staff: StaffType[];
  team: TeamType;
  cancelText: string;
}) {
  const { onConfirm, onCancel, team, staff, loading, cancelText } = props;
  const { t } = useTranslation();

  const [value, setValue] = useState<string[]>([]);
  const [error, setError] = useState("");

  const staffMissing = differenceWith(
    eqBy(path(["userInfo", "id"])),
    staff,
    team.members
  );

  return (
    <ModalForm
      opened={true}
      onCancel={() => {
        setError("");
        onCancel();
      }}
      isLoading={loading}
      onConfirm={() => {
        if (value.length === 0) {
          setError(t("settings.teams.modal.edit.field.member.error.required"));
        } else {
          setError("");
          onConfirm(value);
        }
      }}
      title={t("settings.teams.modal.add.header")}
      subTitle={t("settings.teams.modal.add.subheader")}
      confirmText={t("settings.teams.modal.add.button.confirm")}
      cancelText={cancelText}
    >
      <div className="ui form">
        <Form.Input
          label={t("settings.teams.modal.edit.field.member.label")}
          error={error || false}
        >
          <Dropdown
            placeholder={t("settings.teams.modal.edit.field.name.placeholder")}
            multiple
            fluid
            value={value}
            search={(options, value) => {
              const matchedIds = staffMissing
                .filter(staffMatcher(value))
                .map(path(["userInfo", "id"]));
              return options.filter((option) =>
                matchedIds.includes(option.value)
              );
            }}
            onChange={(event, data) => {
              setValue(data.value as string[]);
            }}
            options={staffMissing.map((s, idx) => ({
              key: idx,
              value: s.userInfo.id,
              content: (
                <span className={"selected-dropdown"}>
                  <StaffAvatar staff={s} size={"20px"} />
                  <span className="display-text">{staffDisplayName(s)}</span>
                </span>
              ),
            }))}
            renderLabel={(item, idx) => {
              const user = staff.find(matchesStaffId(item.value as string));
              if (!user) {
                return null;
              }
              return (
                <Label className={"staff"}>
                  <StaffAvatar staff={user} size={"16px"} />
                  {staffDisplayName(user)}
                  <Icon
                    name={"close"}
                    onClick={() => {
                      setValue(remove(idx, 1, value));
                    }}
                  />
                </Label>
              );
            }}
          />
        </Form.Input>
      </div>
    </ModalForm>
  );
}
