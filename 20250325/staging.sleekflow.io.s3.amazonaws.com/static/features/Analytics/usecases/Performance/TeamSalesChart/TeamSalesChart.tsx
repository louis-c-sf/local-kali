import React from "react";
import styles from "features/Analytics/usecases/Performance/TeamSalesChart/TeamSalesChart.module.css";
import { useTranslation } from "react-i18next";
import ReactApexChart from "react-apexcharts";
import { TeamStatRecordType } from "api/Analytics/fetchSalesPerformance";
import { useTeams } from "container/Settings/useTeams";

export function TeamSalesChart(props: {
  data: TeamStatRecordType[];
  currency: string;
}) {
  const { data, currency } = props;
  const { teams } = useTeams();
  const { t } = useTranslation();
  const chartHeight = data.length * 20 + 180;

  function getTeamName(rec: TeamStatRecordType) {
    return teams.find((t) => t.id === parseInt(rec.teamId))?.name;
  }

  return (
    <div className={styles.root}>
      <div className={styles.head}>{t("analytics.performance.team.head")}</div>
      <div className={styles.chart}>
        <ReactApexChart
          type={"bar"}
          height={`${chartHeight}px`}
          series={[
            {
              data: [...data].map((rec) => ({
                x: getTeamName(rec) ?? rec.teamId,
                y: rec.totalPrice,
              })),
            },
          ]}
          options={{
            colors: ["#6078FF"],
            chart: {
              toolbar: { show: false },
              redrawOnParentResize: true,
            },
            grid: {
              xaxis: {
                lines: {
                  show: true,
                },
              },
              yaxis: {
                lines: {
                  show: false,
                },
              },
            },
            dataLabels: { enabled: false },
            tooltip: { enabled: false },
            xaxis: {
              axisBorder: { show: false },
              axisTicks: {
                show: false,
              },
              tickAmount: 10,
              title: {
                text: t("analytics.performance.team.convertedAmount", {
                  currency,
                }),
                offsetY: 12,
                style: {
                  cssClass: styles.label,
                },
              },
            },
            yaxis: {
              axisBorder: { show: false },
              axisTicks: {
                show: false,
              },
              labels: {
                style: {
                  cssClass: styles.label,
                },
              },
            },
            states: {
              hover: {
                filter: {
                  type: "none",
                },
              },
              active: {
                filter: {
                  type: "none",
                },
              },
            },
            plotOptions: {
              bar: {
                horizontal: true,
              },
            },
          }}
        />
      </div>
    </div>
  );
}
