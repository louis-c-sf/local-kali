import React, { ReactNode } from "react";
import styles from "features/Analytics/usecases/Performance/TotalSalesChart/SummaryItem.module.css";
import { useTranslation } from "react-i18next";
import { PercentageBadge } from "features/Analytics/components/PercentageBadge";
import { formatNumber } from "utility/string";
import { InfoTooltip } from "component/shared/popup/InfoTooltip";
import { getPercentage } from "utility/math/getPercentage";

export function SummaryItem(props: {
  current: number;
  previous: number;
  period: string;
  head: string;
  type: "total" | "conversions" | "influence";
  totalSales: number;
  hint?: ReactNode;
}) {
  const { head, period, current, previous, hint, type, totalSales } = props;
  const { t } = useTranslation();

  function showNumber(n: number) {
    return formatNumber(n, {
      maximumFractionDigits: 0,
    });
  }
  const ratio = getPercentage(totalSales, current);

  return (
    <div className={`${styles.root} ${styles[type]}`}>
      <div className={styles.head}>
        <div className={styles.text}>{head}</div>
        {hint && <InfoTooltip placement={"right"}>{hint}</InfoTooltip>}
      </div>
      <div className={styles.main}>
        <div className={styles.value}>
          {showNumber(current)} ({ratio.toFixed(2)}%)
        </div>
        {previous - current !== 0 && (
          <div className={styles.percent}>
            <PercentageBadge current={current} prev={previous} />
          </div>
        )}
      </div>
      <div className={styles.previous}>
        <div className={styles.label}>
          {t("analytics.performance.summary.previous", { period })}
        </div>
        <div className={styles.value}>{showNumber(previous)}</div>
      </div>
    </div>
  );
}
