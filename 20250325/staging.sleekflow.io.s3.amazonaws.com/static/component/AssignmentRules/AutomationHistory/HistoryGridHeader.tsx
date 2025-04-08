import React, { useCallback, useEffect, useState } from "react";
import ReactDatePicker from "react-datepicker";
import { Dropdown, DropdownProps, Image, Menu, Tab } from "semantic-ui-react";
import moment from "moment";
import { useTranslation } from "react-i18next";
import crossIcon from "./assets/cross.svg";
import styles from "./HistoryGridHeader.module.css";
import {
  AutomationHistoriesFilterParamsType,
  AutomationTypeEnum,
} from "../../../types/AssignmentRuleType";
import { useAutomationRulesLocalized } from "../AutomationRuleEdit/localizable/useAutomationRulesLocalized";
import {
  TabEnum,
  TabInfoType,
} from "../AutomationRuleEdit/CreateRule/FbIg/PostCommentTypes";

interface HistoryGridHeaderPropsType {
  ruleName: string;
  isDefault: boolean;
  automationType: AutomationTypeEnum;
  status: string;
  onFilterChange: (filters: AutomationHistoriesFilterParamsType) => void;
  setTab: (tab: TabEnum) => void;
  tab: TabEnum;
  tabInfo: TabInfoType;
}

export default HistoryGridHeader;

function HistoryGridHeader(props: HistoryGridHeaderPropsType) {
  const {
    ruleName,
    isDefault,
    automationType,
    status,
    onFilterChange,
    setTab,
    tab,
    tabInfo,
  } = props;
  const { t } = useTranslation();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [dateRangeString, setDateRangeString] = useState("");
  const [triggerStatus, setTriggerStatus] = useState<number | null>(null);
  const [isDateRangeSelected, setIsDateRangeSelected] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const { automationTypeNameMap } = useAutomationRulesLocalized();
  const triggerStatusChoices = [
    {
      key: "success",
      text: t("automation.history.status.success"),
      value: 0,
    },
    {
      key: "error",
      text: t("automation.history.status.errored"),
      value: 1,
    },
  ];

  const buildFilters = useCallback(
    (
      triggerStatus?: number | null,
      startDate?: Date | null,
      endDate?: Date | null
    ) => {
      let filters = {};
      if (triggerStatus !== null) {
        filters = {
          status: triggerStatus,
        };
      }
      if (startDate && endDate) {
        filters = {
          ...filters,
          start: moment(startDate).startOf("day").format("YYYY-MM-DDTHH:mm:ss"),
          end: moment(endDate).endOf("day").format("YYYY-MM-DDTHH:mm:ss"),
        };
      }
      return filters;
    },
    []
  );

  useEffect(() => {
    if (!startDate && !endDate) {
      return;
    }
    if (startDate && endDate) {
      setIsDateRangeSelected(true);
      setIsCalendarOpen(false);
    } else {
      setIsDateRangeSelected(false);
    }
    const startString = startDate ? moment(startDate).format("L") : "";
    const endString = endDate ? moment(endDate).format("L") : "";
    setDateRangeString(`${startString} - ${endString}`);
  }, [startDate, endDate]);

  useEffect(() => {
    if (!isDateRangeSelected) {
      return;
    }
    const filters =
      triggerStatus !== null
        ? buildFilters(triggerStatus, startDate, endDate)
        : buildFilters(null, startDate, endDate);
    onFilterChange(filters);
  }, [isDateRangeSelected]);

  useEffect(() => {
    if (triggerStatus === null) {
      return;
    }
    const filters = isDateRangeSelected
      ? buildFilters(triggerStatus, startDate, endDate)
      : buildFilters(triggerStatus, null, null);
    onFilterChange(filters);
  }, [triggerStatus]);

  const handleDateRangeChange = (dateRange: Date | null) => {
    if (!dateRange) {
      clearDateRange();
      return;
    }
    setStartDate(dateRange[0]);
    setEndDate(dateRange[1]);
  };

  const clearDateRange = () => {
    setStartDate(null);
    setEndDate(null);
    setDateRangeString("");
    setIsDateRangeSelected(false);
    setIsCalendarOpen(false);
    onFilterChange(
      triggerStatus === null
        ? buildFilters(null, null, null)
        : buildFilters(triggerStatus, null, null)
    );
  };

  const clearTriggerStatus = () => {
    setTriggerStatus(null);
    onFilterChange(
      isDateRangeSelected
        ? buildFilters(null, startDate, endDate)
        : buildFilters(null, null, null)
    );
  };

  const mainPanes = [
    {
      menuItem: (
        <Menu.Item key="sent">
          <span className="title">{t("automation.history.tab.sent")}</span>
          <span className="number">{tabInfo.sent}</span>
        </Menu.Item>
      ),
    },
    {
      menuItem: (
        <Menu.Item key="newContact">
          <span className="title">
            {t("automation.history.tab.newContact")}
          </span>
          <span className="number">{tabInfo.newContact.number}</span>
          <span className="percentage">({tabInfo.newContact.percentage}%)</span>
        </Menu.Item>
      ),
    },
    {
      menuItem: (
        <Menu.Item key="replied">
          <span className="title">{t("automation.history.tab.replied")}</span>
          <span className="number">{tabInfo.replied.number}</span>
          <span className="percentage">({tabInfo.replied.percentage}%)</span>
        </Menu.Item>
      ),
    },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.textWrap}>
        <div className={styles.title}>
          {isDefault ? t("automation.rule.default.name") : ruleName}
        </div>
        <div className={styles.subTitle}>
          {isDefault ? (
            <div className={`${styles.status} ${styles.live}`}>
              {t("automation.rule.default.short")}
            </div>
          ) : (
            <>
              <div className={styles.type}>
                {automationTypeNameMap[automationType]}
              </div>
              <div
                className={`${styles.status} ${
                  status === "Live" ? styles.live : ""
                }`}
              >
                {status === "Live"
                  ? t("automation.rule.status.live")
                  : t("automation.rule.status.draft")}
              </div>
            </>
          )}
        </div>
      </div>
      <div className={styles.filterWrap}>
        <div
          className={`${styles.dateRangePicker} ${
            isDateRangeSelected ? styles.selectedDateRangePicker : ""
          }`}
        >
          <ReactDatePicker
            open={isCalendarOpen}
            onInputClick={() => setIsCalendarOpen(true)}
            value={dateRangeString}
            selected={startDate}
            startDate={startDate}
            endDate={endDate}
            selectsRange
            onBlur={() => setIsCalendarOpen(false)}
            onChange={handleDateRangeChange}
            shouldCloseOnSelect={false}
            placeholderText={t("automation.history.filters.dateRange")}
          />
          {isDateRangeSelected && (
            <div className={styles.clearIconWrap} onClick={clearDateRange}>
              <Image src={crossIcon} />
            </div>
          )}
        </div>
        <div
          className={`${styles.triggerStatus} ${
            triggerStatus !== null ? styles.selectedTriggerStatus : ""
          }`}
        >
          <Dropdown
            onChange={(_, data: DropdownProps) => {
              setTriggerStatus(data.value as number);
            }}
            value={triggerStatus as number}
            options={triggerStatusChoices}
            placeholder={t("automation.history.filters.status")}
            selection
            search
            selectOnBlur={false}
          />
          {triggerStatus !== null && (
            <div className={styles.clearIconWrap} onClick={clearTriggerStatus}>
              <Image src={crossIcon} />
            </div>
          )}
        </div>
      </div>
      {["InstagramMediaComment", "FacebookPostComment"].includes(
        automationType
      ) && (
        <Tab
          className={styles.tab}
          menu={{ secondary: true, pointing: true }}
          panes={mainPanes}
          onTabChange={(event: React.MouseEvent, data: Object) =>
            setTab(data["activeIndex"])
          }
          activeIndex={tab}
        />
      )}
    </header>
  );
}
