import styles from "./PaymentList.module.css";
import { Pagination } from "./Pagination";
import React from "react";
import { LoadPageInterface } from "./contracts";
import { RefundItem } from "./RefundItem";
import { PaymentHistoryRecordNormalizedType } from "core/models/Ecommerce/Payment/PaymentLinkType";

export function RefundList(props: {
  payments: PaymentHistoryRecordNormalizedType[];
  pagesTotal: number;
  page: number;
  loadPage: LoadPageInterface;
}) {
  const { pagesTotal, payments, loadPage, page } = props;
  return (
    <div>
      {payments.map((pmt, idx) => (
        <RefundItem
          payment={pmt}
          key={pmt.paymentId}
          isLast={idx === payments.length - 1}
        />
      ))}
      {pagesTotal > 1 && (
        <div className={styles.pagination}>
          <Pagination pagesTotal={pagesTotal} page={page} onChange={loadPage} />
        </div>
      )}
    </div>
  );
}
