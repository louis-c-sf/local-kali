import React from "react";
import ReactApexChart from "react-apexcharts";

export function PieChart(props: { series: number[]; colors: string[] }) {
  let { series, colors } = props;

  return (
    <ReactApexChart
      series={series}
      type={"donut"}
      options={{
        colors,
        fill: { type: "solid", opacity: [1, 1, 1] },
        tooltip: { enabled: false },
        legend: { show: false },
        dataLabels: { enabled: false },
        plotOptions: {
          pie: {
            expandOnClick: false,
            customScale: 1.4,
            donut: {
              size: "82%",
              labels: {
                show: false,
              },
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
      }}
    />
  );
}
