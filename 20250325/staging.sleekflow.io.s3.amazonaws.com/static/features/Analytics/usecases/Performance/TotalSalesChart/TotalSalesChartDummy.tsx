import React from "react";
import styles from "features/Analytics/usecases/Performance/TotalSalesChart/TotalSalesChart.module.css";
import { useTranslation } from "react-i18next";
import { SummaryItemDummy } from "features/Analytics/usecases/Performance/TotalSalesChart/SummaryItemDummy";

export function TotalSalesChartDummy(props: {}) {
  const { t } = useTranslation();

  return (
    <div className={`${styles.root} ${styles.pending}`}>
      <div className={styles.head}>{t("analytics.performance.header")}</div>
      <div className={styles.summary}>
        <div className={styles.item}>
          <SummaryItemDummy />
        </div>
        <div className={styles.item}>
          <SummaryItemDummy />
        </div>
      </div>
      <div className={styles.chart}>
        <div className={styles.chartWrap}>{t("analytics.loading")}...</div>
      </div>
    </div>
  );
}
