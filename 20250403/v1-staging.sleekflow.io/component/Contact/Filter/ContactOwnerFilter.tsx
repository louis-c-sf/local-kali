import { useTranslation } from "react-i18next";
import { CheckableDropdownInput } from "./CheckableDropdownInput";
import React from "react";
import { staffDisplayName } from "../../Chat/utils/staffDisplayName";
import { useAppSelector } from "../../../AppRootContext";
import { StaffType } from "../../../types/StaffType";

export function ContactOwnerFilter(props: {
  values: string[];
  onChange: (values: string[]) => void;
}) {
  let { values, onChange } = props;
  const staffList = useAppSelector((s) => s.staffList);
  const { t } = useTranslation();

  const serialize = (staff: StaffType) => {
    return staff.userInfo.id;
  };
  return (
    <CheckableDropdownInput
      placeholder={t("profile.staticField.contactOwner.name")}
      serializeValue={serialize}
      values={staffList.filter((s) => values.includes(serialize(s)))}
      onChange={(items) => {
        onChange(items.map(serialize));
      }}
      items={staffList}
      getLabel={(item) => staffDisplayName(item)}
      subtitle={t("profile.condition.option.Contains")}
    />
  );
}
