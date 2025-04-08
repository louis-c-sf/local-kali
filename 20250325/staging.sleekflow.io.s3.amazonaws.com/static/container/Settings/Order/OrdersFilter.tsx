import React, { useState } from "react";
import styles from "./OrdersFilter.module.css";
import { Dropdown, DropdownProps } from "semantic-ui-react";
import { useTranslation } from "react-i18next";
import { Moment } from "moment/moment";
import { FilterType } from "./useFetchStripePage";
import { mergeRight, partition } from "ramda";
import { DateRangePicker, FocusedInputShape } from "react-dates";
import { StaffType } from "../../../types/StaffType";
import { DropdownOptionType } from "../../../component/Chat/ChannelFilterDropdown";
import { staffDisplayName } from "../../../component/Chat/utils/staffDisplayName";
import { useAppSelector } from "../../../AppRootContext";
import { Button } from "component/shared/Button/Button";
import { ExportModal } from "./ExportModal";
import { getQueryMatcher } from "container/Settings/filters/getQueryMatcher";

export const ALL = "USERS_SHOW_ALL";
export const PLATFORM_GENERATED = "PLATFORM_GENERATED";

type MenuItemType = { name: string; content: string };
const collator = new Intl.Collator(navigator.language ?? "en");
const byValueAsc = (o1: DropdownOptionType, o2: DropdownOptionType) =>
  collator.compare(o1.text, o2.text);

export function OrdersFilter(props: {
  filter: FilterType;
  onChange: (filter: FilterType) => void;
  maxDate: Moment;
  staffList: StaffType[];
  disabled: boolean;
  showStaffFilter: boolean;
}) {
  const { filter, onChange, maxDate, staffList, disabled, showStaffFilter } =
    props;
  const { t } = useTranslation();
  const userId = useAppSelector((s) => s.user.id);
  const [showExportModal, setShowExportModal] = useState(false);

  const statuses: MenuItemType[] = [
    {
      name: "Pending",
      content: t("settings.paymentLink.order.status.pending.plural"),
    },
    {
      name: "Canceled",
      content: t("settings.paymentLink.order.status.canceled.plural"),
    },
    {
      name: "Paid",
      content: t("settings.paymentLink.order.status.paid.plural"),
    },
    {
      name: "All",
      content: t("settings.paymentLink.order.status.all.plural"),
    },
  ];

  function getDisplayName(s: StaffType) {
    const name = staffDisplayName(s);
    if (s.userInfo.id === userId) {
      return `${name} (${t("user.me")})`;
    }
    return name;
  }

  const staffOptionsSorted = staffList.map<DropdownOptionType>((s, idx) => ({
    text: getDisplayName(s),
    key: idx,
    active: filter.user === s.userInfo.id,
    value: s.userInfo.id,
  }));

  staffOptionsSorted.sort(byValueAsc);

  const initOptions: DropdownOptionType[] = [
    {
      text: t("settings.paymentLink.filter.platformGenerated"),
      key: -2,
      active: filter.user === PLATFORM_GENERATED,
      value: PLATFORM_GENERATED,
    },
    {
      text: t("all"),
      key: -1,
      active: filter.user === ALL,
      value: ALL,
    },
  ];
  const [[meOption], restStaffOptions] = partition(
    (o) => o.value === userId,
    staffOptionsSorted
  );

  if (meOption) {
    initOptions.push(meOption);
  }
  const staffOptions = [...initOptions, ...restStaffOptions];

  const [focusedDatepicker, setFocusedDatepicker] =
    useState<FocusedInputShape | null>(null);

  function setUser(_: any, data: DropdownProps) {
    const id = data.value as string;
    onChange(mergeRight(filter, { user: id }));
  }

  function setDateRange(value: {
    startDate: Moment | null;
    endDate: Moment | null;
  }) {
    const { startDate, endDate } = value;
    const merge: Partial<FilterType> = {};
    if (startDate) {
      merge.dateFrom = startDate;
    }
    if (endDate) {
      merge.dateTo = endDate;
    }
    onChange(mergeRight(filter, merge));
  }

  function statusSetter(status: string) {
    return () => onChange(mergeRight(filter, { status }));
  }

  function getTabClasses(s: MenuItemType) {
    return `${styles.item} ${s.name === filter.status ? styles.selected : ""}`;
  }

  return (
    <>
      <div className={styles.filters}>
        <div className={styles.inputs}>
          {showStaffFilter && (
            <div className={styles.item}>
              <div className="ui form">
                <Dropdown
                  selection
                  search
                  value={filter.user}
                  onChange={setUser}
                  options={staffOptions}
                  disabled={disabled}
                />
              </div>
            </div>
          )}
          <div className={styles.item}>
            <DateRangePicker
              disabled={disabled}
              startDate={filter.dateFrom || null}
              startDateId="1"
              endDate={filter.dateTo || null}
              endDateId="2"
              hideKeyboardShortcutsPanel={true}
              focusedInput={focusedDatepicker}
              onFocusChange={setFocusedDatepicker}
              onDatesChange={setDateRange}
              isOutsideRange={(date) => date.isAfter(maxDate)}
            />
          </div>
        </div>
        <Button blue onClick={() => setShowExportModal(true)}>
          {t("settings.paymentLink.order.export.button")}
        </Button>
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
      {showExportModal && (
        <ExportModal
          showModal={showExportModal}
          onClose={() => setShowExportModal(false)}
          startDate={filter.dateFrom}
          endDate={filter.dateTo}
        />
      )}
    </>
  );
}
