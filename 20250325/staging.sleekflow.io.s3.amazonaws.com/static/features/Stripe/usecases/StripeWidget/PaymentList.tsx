import React from "react";
import styles from "./PaymentList.module.css";
import { PaymentItem } from "./PaymentItem";
import { LoadPageInterface } from "./contracts";
import { Pagination } from "./Pagination";
import { PaymentHistoryRecordNormalizedType } from "core/models/Ecommerce/Payment/PaymentLinkType";

export function showCurrency(currency: string) {
  if (
    ["USD", "HKD", "AUD", "SGD", "CAD", "TWD", "NZD", "JMD"].includes(
      currency.toUpperCase()
    )
  ) {
    return `${currency.toUpperCase().substr(0, 2)}$`;
  }
  return currency.toUpperCase();
}

export function PaymentList(props: {
  payments: PaymentHistoryRecordNormalizedType[];
  pagesTotal: number;
  page: number;
  loadPage: LoadPageInterface;
}) {
  const { page, pagesTotal, payments, loadPage } = props;

  return (
    <div>
      {payments.map((payment, i) => (
        <PaymentItem
          payment={payment}
          isLast={i === payments.length - 1}
          key={payment.paymentId ?? i}
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
