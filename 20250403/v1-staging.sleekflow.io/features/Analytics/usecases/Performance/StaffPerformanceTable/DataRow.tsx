import React, { ReactNode } from "react";
import styles from "./StaffPerformanceTable.module.css";
import { StaffCell } from "features/Analytics/usecases/Performance/StaffPerformanceTable/StaffCell";
import { ProgressCell } from "features/Analytics/usecases/Performance/StaffPerformanceTable/ProgressCell";
import { formatNumber } from "utility/string";
import { Table } from "semantic-ui-react";
import { StaffPerformanceRecordType } from "api/Analytics/fetchStaffPerformance";
import { StaffType } from "types/StaffType";
import { getPercentage } from "utility/math/getPercentage";
import { InfoTooltip } from "component/shared/popup/InfoTooltip";

function getConversionRate(row: StaffPerformanceRecordType) {
  const amount =
    row.paymentLinkSharedCount === 0
      ? 0
      : getPercentage(row.paymentLinkSharedCount, row.paymentLinkSharedPaid);
  return Math.min(amount, 100);
}

function getClickRate(row: StaffPerformanceRecordType) {
  return getPercentage(row.linkSharedCount, row.linkSharedClicks);
}

export function DataRow(props: {
  data: StaffPerformanceRecordType;
  name?: string;
  nameHint?: ReactNode;
}): JSX.Element | null {
  const nameContents = props.name ? (
    <>
      {props.name}
      {props.nameHint && (
        <span className={styles.info}>
          <InfoTooltip placement={"right"}>{props.nameHint}</InfoTooltip>
        </span>
      )}
    </>
  ) : (
    <StaffCell staff={props.data.staff} />
  );
  return (
    <Table.Row
      cells={[
        {
          className: styles.staffCell,
          content: nameContents,
        },
        {
          className: styles.valueCell,
          content: props.data.linkSharedCount,
        },
        {
          className: styles.progressCell,
          content: <ProgressCell value={getClickRate(props.data)} />,
        },
        {
          className: styles.valueCell,
          content: props.data.paymentLinkSharedCount,
        },
        {
          className: styles.progressCell,
          content: <ProgressCell value={getConversionRate(props.data)} />,
        },
        {
          className: styles.moneyCell,
          content: formatNumber(props.data.paymentLinkConvertedAmount, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
        },
      ]}
    />
  );
}
