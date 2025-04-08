import React from "react";
import styles from "features/Analytics/usecases/Performance/TotalSalesChart/TotalSalesChart.module.css";
import { Trans, useTranslation } from "react-i18next";
import { getPercentage } from "utility/math/getPercentage";
import { PercentageBadge } from "features/Analytics/components/PercentageBadge";
import { SummaryItem } from "features/Analytics/usecases/Performance/TotalSalesChart/SummaryItem";
import { PieChart } from "features/Analytics/usecases/Performance/TotalSalesChart/PieChart";

export function TotalSalesChart(props: {
  totalSales: number;
  convertedSales: number;
  totalSalesPrev: number;
  convertedSalesPrev: number;
  influenceSalesPrev: number;
  influenceSales: number;
  period: string;
}) {
  const {
    convertedSales,
    influenceSales,
    influenceSalesPrev,
    totalSales,
    totalSalesPrev,
    convertedSalesPrev,
    period,
  } = props;
  const { t } = useTranslation();
  const rate = getPercentage(totalSales, convertedSales + influenceSales);
  const prevRate = getPercentage(
    totalSalesPrev,
    convertedSalesPrev + influenceSalesPrev
  );
  const rateShift = prevRate - rate;

  return (
    <div className={styles.root}>
      <div className={styles.head}>{t("analytics.performance.header")}</div>
      <div className={styles.summary}>
        <div className={styles.item}>
          <SummaryItem
            head={t("analytics.performance.summary.conversions.head")}
            hint={
              <Trans i18nKey={"analytics.performance.summary.conversions.hint"}>
                <p>
                  When customers make a payment, if your staff has contacted
                  them via SleekFlow within N days, this order will be counted
                  into the sales amount.
                </p>
                <p>
                  You can also make changes to this conversion window (N days)
                  here.
                </p>
              </Trans>
            }
            current={convertedSales}
            previous={convertedSalesPrev}
            totalSales={totalSales}
            period={period}
            type={"conversions"}
          />
        </div>
        <div className={styles.item}>
          <SummaryItem
            head={t("analytics.performance.summary.influence.head")}
            hint={
              <Trans i18nKey={"analytics.performance.summary.influence.hint"}>
                <p>
                  When customers make a payment, if your staff has contacted
                  them via SleekFlow within N days, this order will be counted
                  into the sales amount.
                </p>
                <p>
                  You can also make changes to this conversion window (N days)
                  here.
                </p>
              </Trans>
            }
            current={influenceSales}
            previous={influenceSalesPrev}
            totalSales={totalSales}
            period={period}
            type={"influence"}
          />
        </div>
        <div className={styles.item}>
          <SummaryItem
            head={t("analytics.performance.summary.others.head")}
            current={totalSales - influenceSales - convertedSales}
            previous={totalSalesPrev - influenceSalesPrev - convertedSalesPrev}
            totalSales={totalSales}
            period={period}
            type={"total"}
          />
        </div>
      </div>
      <div className={styles.chart}>
        <div className={styles.chartWrap}>
          <PieChart
            series={[
              totalSales - convertedSales - influenceSales,
              influenceSales,
              convertedSales,
            ]}
            colors={["#EAEAEA", "#94C2FB", "#6078FF"]}
          />
        </div>
        <div className={styles.conversion}>
          <div className={styles.label}>
            {t("analytics.performance.conversionRate")}
          </div>
          <div className={styles.amount}>{totalSales}</div>
          <div className={styles.percent}>
            {rateShift !== 0 && (
              <PercentageBadge prev={prevRate} current={rate} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
