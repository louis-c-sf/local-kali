import React from "react";
import styles from "../Order/OrdersFilter.module.css";
import { Dropdown, DropdownProps } from "semantic-ui-react";
import { useTranslation } from "react-i18next";
import { FilterType } from "../Order/useFetchStripePage";
import { mergeRight } from "ramda";
import { StaffType } from "../../../types/StaffType";
import { DropdownOptionType } from "../../../component/Chat/ChannelFilterDropdown";
import { staffDisplayName } from "../../../component/Chat/utils/staffDisplayName";
import { useAppSelector } from "../../../AppRootContext";

export const ALL = "USERS_SHOW_ALL";

type MenuItemType = { name: string; content: string };

export function RefundFilter(props: {
  filter: FilterType;
  onChange: (filter: FilterType) => void;
  staffList: StaffType[];
  disabled: boolean;
  showStaffFilter: boolean;
}) {
  const { filter, onChange, staffList, disabled, showStaffFilter } = props;
  const { t } = useTranslation();
  const userId = useAppSelector((s) => s.user.id);

  const statuses: MenuItemType[] = [
    {
      name: "Refunded",
      content: t("settings.paymentLink.refund.status.refunded"),
    },
    {
      name: "PartialRefund",
      content: t("settings.paymentLink.refund.status.partialRefund"),
    },
    {
      name: "RefundPending",
      content: t("settings.paymentLink.refund.status.refundPending"),
    },
    {
      name: "RefundFailed",
      content: t("settings.paymentLink.refund.status.refundFailed"),
    },
    {
      name: "RefundAll",
      content: t("settings.paymentLink.refund.status.all"),
    },
  ];

  function getDisplayName(s: StaffType) {
    const name = staffDisplayName(s);
    if (s.userInfo.id === userId) {
      return `${name} (${t("user.me")})`;
    }
    return name;
  }

  const staffOptions: DropdownOptionType[] = [
    {
      text: t("all"),
      key: -1,
      active: filter.user === ALL,
      value: ALL,
    },
    ...staffList.map<DropdownOptionType>((s, idx) => ({
      text: getDisplayName(s),
      key: idx,
      active: filter.user === s.userInfo.id,
      value: s.userInfo.id,
    })),
  ];

  function setUser(_: any, data: DropdownProps) {
    const id = data.value as string;
    onChange(mergeRight(filter, { user: id }));
  }

  function statusSetter(status: string) {
    return () => onChange(mergeRight(filter, { status }));
  }

  function getTabClasses(s: MenuItemType) {
    return `${styles.item} ${s.name === filter.status ? styles.selected : ""}`;
  }

  return (
    <>
      <div className={styles.inputs}>
        {showStaffFilter && (
          <div className={styles.item}>
            <div className="ui form">
              <Dropdown
                selection
                value={filter.user}
                onChange={setUser}
                options={staffOptions}
                disabled={disabled}
              />
            </div>
          </div>
        )}
      </div>
      <div className={styles.tabs}>
        {statuses.map((s) => (
          <div className={getTabClasses(s)}>
            <div className={styles.label} onClick={statusSetter(s.name)}>
              {s.content}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
