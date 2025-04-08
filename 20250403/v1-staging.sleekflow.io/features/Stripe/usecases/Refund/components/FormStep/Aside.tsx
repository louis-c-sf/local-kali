import React from "react";
import styles from "./Aside.module.css";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "../../../../../../utility/string";
import { StripeOrderType } from "types/Stripe/Settings/StripeOrderType";
import { PaymentHistoryRecordType } from "core/models/Ecommerce/Payment/PaymentLinkType";
import { getPaymentAmount } from "core/models/Ecommerce/Payment/getPaymentAmount";
import moment from "moment";
import { useCurrentUtcOffset } from "component/Chat/hooks/useCurrentUtcOffset";

export function Aside(props: {
  payment: PaymentHistoryRecordType | StripeOrderType;
}) {
  const { t } = useTranslation();
  let { payment } = props;
  const [firstPayment] = payment.lineItems;
  const utcOffset = useCurrentUtcOffset();
  return (
    <div className={styles.aside}>
      <div className={styles.summary}>
        <div className={styles.head}>
          <div className={styles.row}>
            <div className={styles.label}>
              {t("chat.paymentLink.statusWidget.field.payment")}
            </div>
            <div className={styles.value}>{payment.paymentId}</div>
          </div>
          <div className={styles.row}>
            <div className={styles.label}>
              {t("chat.paymentLink.statusWidget.field.completedAt")}
            </div>
            <div className={styles.value}>
              {moment(payment.paidAt)
                .utcOffset(utcOffset)
                ?.format("YYYY-MM-DD hh:mm A")}
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.label}>
              {t("chat.paymentLink.statusWidget.field.orderTotal")}
            </div>
            <div className={styles.value}>
              {formatCurrency(payment.payAmount, firstPayment.currency)}
            </div>
          </div>
        </div>
      </div>
      <div className={styles.items}>
        {payment.lineItems.map((item, idx) => {
          const imageSrc = item.images?.[0];

          return (
            <div className={styles.item} key={`${item.name}_${idx}`}>
              <div className={`${styles.pic} ${imageSrc ? "" : styles.empty}`}>
                {imageSrc && <img src={imageSrc} alt="" />}
                <div className={styles.count}>{item.quantity ?? 0}</div>
              </div>
              <div className={styles.details}>
                <div className={styles.name}>{item.name}</div>
                <div className={styles.param}>{item.description}</div>
                <div className={styles.price}>
                  {formatCurrency(
                    getPaymentAmount(item),
                    item.currency ?? "HKD"
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
