import React from "react";
import styles from "./OrderItem.module.css";
import { showCurrency } from "./PaymentList";
import { formatCurrency } from "../../../../utility/string";
import { PaymentLinkType } from "core/models/Ecommerce/Payment/PaymentLinkType";
import { getPaymentAmount } from "core/models/Ecommerce/Payment/getPaymentAmount";

export function OrderItem(props: { item: PaymentLinkType; index: number }) {
  const { item, index } = props;
  const hasImages = item.images && item.images.length > 0;
  const [src] = item.images ?? [];
  return (
    <div
      className={`${styles.item} ${hasImages ? "" : styles.noImage}`}
      key={`${item.name}${index}`}
    >
      <div className={styles.pic}>
        {hasImages && src && <img src={src} />}
        <div className={styles.quantitiy}>{item.quantity}</div>
      </div>
      <div>
        <div className={styles.title}>{item.name}</div>
        <div className={styles.subtitle}>{item.description}</div>
        <div>
          {`${showCurrency(item.currency)} `}
          {formatCurrency(getPaymentAmount(item))}
        </div>
      </div>
    </div>
  );
}
