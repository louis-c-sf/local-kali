import React from "react";
import styles from "./PaymentLinkDetail.module.css";
import { Image } from "semantic-ui-react";
import { useTranslation } from "react-i18next";
import { showCurrency } from "features/Stripe/usecases/StripeWidget/PaymentList";
import { formatCurrency } from "utility/string";
import { PaymentLinkSetType } from "core/models/Ecommerce/Payment/PaymentLinkType";
import { getPaymentsSum } from "core/models/Ecommerce/Payment/getPaymentsSum";

export default function PaymentLinkDetail(props: {
  paymentLink: PaymentLinkSetType;
}) {
  const { paymentLink } = props;
  const { t } = useTranslation();
  return (
    <div className={`container ${styles.container}`}>
      <div className={styles.header}>
        {t("broadcast.edit.paymentLink.label")}
      </div>
      <div className={styles.body}>
        <div className={styles.totalRow}>
          <div>
            {t("broadcast.edit.paymentLink.itemCount", {
              count: paymentLink.lineItems.length,
            })}
          </div>
          <div>{`${showCurrency(
            paymentLink.lineItems[0].currency || "HKD"
          )} ${formatCurrency(getPaymentsSum(paymentLink.lineItems))}`}</div>
        </div>
        {paymentLink.lineItems.map((item) => (
          <div className={styles.itemRow}>
            <div className={styles.imageWrapper}>
              <Image src={item.images?.[0]} className={styles.image} />
              <span className={styles.quantity}>{item.quantity}</span>
            </div>
            <div className={styles.detail}>
              <div className={styles.itemName}>{item.name}</div>
              <div className={styles.spec}>{item.description}</div>
              <div className={styles.price}>
                {`${showCurrency(item.currency || "HKD")} ${formatCurrency(
                  Number(item.amount) * item.quantity -
                    item.totalDiscount * item.quantity
                )}`}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
