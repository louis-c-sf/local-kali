import React from "react";
import styles from "features/Analytics/usecases/Performance/TeamSalesChart/TeamSalesChart.module.css";
import { useTranslation } from "react-i18next";
import { useTeams } from "container/Settings/useTeams";

export function TeamSalesChartDummy() {
  const { teams } = useTeams();
  const { t } = useTranslation();
  const chartHeight = teams.length * 20 + 180;

  return (
    <div className={styles.root}>
      <div className={styles.head}>{t("analytics.performance.team.head")}</div>
      <div
        className={`${styles.chart} ${styles.dummy}`}
        style={{ height: `${chartHeight}px` }}
      >
        {t("analytics.loading")}...
      </div>
    </div>
  );
}
