import React, { useState } from "react";
import styles from "features/Analytics/usecases/Performance/StaffPerformanceTable/StaffPerformanceTable.module.css";
import {
  Dimmer,
  Loader,
  Menu,
  StrictTableHeaderCellProps,
  Table,
} from "semantic-ui-react";
import { useTranslation } from "react-i18next";
import { InfoTooltip } from "component/shared/popup/InfoTooltip";
import {
  SortParamType,
  StaffPerformanceRecordType,
} from "api/Analytics/fetchStaffPerformance";
import { getPercentage } from "utility/math/getPercentage";
import { formatNumber } from "utility/string";
import { ProgressCell } from "features/Analytics/usecases/Performance/StaffPerformanceTable/ProgressCell";
import gridStyles from "component/shared/grid/Grid.module.css";
import { StaffCell } from "features/Analytics/usecases/Performance/StaffPerformanceTable/StaffCell";
import { useTeams } from "container/Settings/useTeams";
import { matchesStaffId, TeamType } from "types/TeamType";
import { useAccessRulesGuard } from "component/Settings/hooks/useAccessRulesGuard";
import { useAppSelector } from "AppRootContext";
import { MenuItemProps } from "semantic-ui-react/dist/commonjs/collections/Menu/MenuItem";
import { Button } from "component/shared/Button/Button";
import { getNextLoopItem } from "utility/getNextLoopItem";
import { useAdoptToInnerHeight } from "lib/effects/useAdoptToInnerHeight";
import { DataRow } from "features/Analytics/usecases/Performance/StaffPerformanceTable/DataRow";

function getSortValue(fieldName: string, sort: SortParamType | null) {
  const map: Record<
    SortParamType["direction"],
    StrictTableHeaderCellProps["sorted"]
  > = {
    asc: "ascending",
    desc: "descending",
  };
  return sort?.field === fieldName ? map[sort.direction] : undefined;
}

export function StaffPerformanceTable(props: {
  data: StaffPerformanceRecordType[];
  platformGeneratedData?: StaffPerformanceRecordType;
  sort: SortParamType | null;
  hasMore: boolean;
  loadMore: () => void;
  teamId: number | null;
  loading: boolean;
  pageSize: number;
  onSortChange: (sort: SortParamType | null) => void;
  onTeamChange: (id: number | null) => void;
  currency: string;
}) {
  const {
    data,
    onSortChange,
    sort,
    hasMore,
    loadMore,
    onTeamChange,
    teamId,
    loading,
  } = props;
  const { t } = useTranslation();
  const { teams } = useTeams();
  const accessRulesGuard = useAccessRulesGuard();
  const userId = useAppSelector((s) => s.user.id);
  const [wrapRef, setWrapRef] = useState<HTMLElement | null>(null);

  useAdoptToInnerHeight({
    wrapper: wrapRef,
    speed: 700,
    getInnerElement: (wrapper) => wrapper.querySelector("table"),
    isValidMutation: (rec) => rec.target.nodeName === "tbody",
  });

  function isTeamVisible(team: TeamType) {
    if (accessRulesGuard.isAdmin() || accessRulesGuard.isSuperAdmin()) {
      return true;
    }
    return (
      team.teamAdmins.some(matchesStaffId(userId)) ||
      team.members.some(matchesStaffId(userId))
    );
  }

  const NO_TEAM = "NO_TEAM";
  const teamAll: MenuItemProps = {
    name: NO_TEAM,
    content: t("all"),
    active: teamId === null,
  };
  const teamItems = teams.filter(isTeamVisible).map<MenuItemProps>((team) => ({
    name: `${team.id}`,
    content: team.name,
    active: team.id === teamId,
  }));

  function getSortHandler(fieldName: string) {
    return () => {
      let sortParam: SortParamType | null;
      if (fieldName !== sort?.field) {
        sortParam = {
          field: fieldName,
          direction: "asc",
        };
      } else {
        const nextDirection = getNextLoopItem(sort?.direction ?? null, [
          null,
          "asc",
          "desc",
        ]);
        sortParam = nextDirection
          ? { direction: nextDirection, field: fieldName }
          : null;
      }
      onSortChange(sortParam);
    };
  }

  function selectTeam(_: any, item: MenuItemProps) {
    if (item.name === undefined) {
      return;
    }
    const id = item.name === NO_TEAM ? null : parseInt(item.name);
    onTeamChange(id);
  }

  return (
    <div className={styles.root}>
      <div className={styles.head}>{t("analytics.performance.staff.head")}</div>
      <div className={styles.tabs}>
        <Menu
          secondary
          vertical={false}
          pointing
          items={[teamAll, ...teamItems]}
          onItemClick={selectTeam}
        />
      </div>
      <div className={styles.tableWrap} ref={setWrapRef}>
        {loading && (
          <Dimmer inverted active>
            <Loader active />
          </Dimmer>
        )}
        <Table
          basic={"very"}
          sortable
          className={`${styles.table} ${gridStyles.grid} ${gridStyles.frame}`}
        >
          <Table.Header>
            <Table.Row
              cellAs={"th"}
              cells={[
                { content: t("analytics.performance.staff.col.staff.head") },
                {
                  className: "sortable",
                  onClick: getSortHandler("linkSharedCount"),
                  sorted: getSortValue("linkSharedCount", sort),
                  content: t(
                    "analytics.performance.staff.col.productLinks.head"
                  ),
                },
                {
                  content: (
                    <>
                      {t("analytics.performance.staff.col.clickRate.head")}
                      <div className={styles.hint}>
                        <InfoTooltip placement={"top"}>
                          {t("analytics.performance.staff.col.clickRate.hint")}
                        </InfoTooltip>
                      </div>
                    </>
                  ),
                },
                {
                  className: "sortable",
                  onClick: getSortHandler("paymentLinkSharedCount"),
                  sorted: getSortValue("paymentLinkSharedCount", sort),
                  content: t(
                    "analytics.performance.staff.col.paymentLinks.head"
                  ),
                },
                {
                  content: (
                    <>
                      {t("analytics.performance.staff.col.conversionRate.head")}
                      <div className={styles.hint}>
                        <InfoTooltip placement={"top"}>
                          {t(
                            "analytics.performance.staff.col.conversionRate.hint"
                          )}
                        </InfoTooltip>
                      </div>
                    </>
                  ),
                },
                {
                  className: "sortable",
                  onClick: getSortHandler("paymentLinkConvertedAmount"),
                  sorted: getSortValue("paymentLinkConvertedAmount", sort),
                  content: t(
                    "analytics.performance.staff.col.conversionAmount.head",
                    { currency: props.currency }
                  ),
                },
              ]}
            />
          </Table.Header>
          <Table.Body>
            {props.platformGeneratedData && (
              <DataRow
                data={props.platformGeneratedData}
                name={t("analytics.performance.staff.platform.label")}
                nameHint={t("analytics.performance.staff.platform.hint")}
                key={"platform"}
              />
            )}
            {data.map((row, idx) => (
              <DataRow key={idx} data={row} />
            ))}
          </Table.Body>
        </Table>
      </div>
      {hasMore && (
        <div className={styles.pager}>
          <Button
            disabled={loading}
            customSize={"mid"}
            content={t("analytics.performance.staff.loadMore", {
              count: props.pageSize,
            })}
            onClick={loadMore}
          />
        </div>
      )}
    </div>
  );
}
