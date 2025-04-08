import React from "react";
import styles from "./RefundItem.module.css";
import { useTranslation } from "react-i18next";
import { formatCurrency, toFloat } from "../../../../utility/string";
import { usePaymentStatusLocales } from "./usePaymentStatusLocales";
import { MaskedId } from "features/Stripe/usecases/StripeWidget/MaskedId";
import { PaymentHistoryRecordNormalizedType } from "core/models/Ecommerce/Payment/PaymentLinkType";
import { getPaymentsSum } from "core/models/Ecommerce/Payment/getPaymentsSum";

export function RefundItem(props: {
  payment: PaymentHistoryRecordNormalizedType;
  isLast: boolean;
}) {
  const { payment, isLast } = props;
  const currency = payment.lineItems[0]?.currency;
  const { t } = useTranslation();
  const paymentStatusLocales = usePaymentStatusLocales();
  const totalAmount = getPaymentsSum(payment.lineItems);
  return (
    <div className={`${styles.item} ${isLast ? styles.last : ""}`}>
      <div className={styles.line}>
        <div className={styles.label}>
          {t("chat.paymentLink.statusWidget.field.paymentID")}
        </div>
        <div className={styles.value}>
          <MaskedId value={payment.paymentId} />
        </div>
      </div>

      {payment.refundId && (
        <div className={styles.line}>
          <div className={styles.label}>
            {t("chat.paymentLink.statusWidget.field.refundId")}
          </div>
          <div className={styles.value}>
            <MaskedId value={payment.refundId} />
          </div>
        </div>
      )}

      <div className={styles.line}>
        <div className={styles.label}>
          {t("chat.paymentLink.statusWidget.field.orderTotal")}
        </div>
        <div className={styles.value}>
          {formatCurrency(totalAmount, currency)}
        </div>
      </div>
      <div className={styles.line}>
        <div className={styles.label}>
          {t("chat.paymentLink.statusWidget.field.shippingFee")}
        </div>
        <div className={styles.value}>
          {formatCurrency(payment.payAmount - totalAmount, currency)}
        </div>
      </div>
      {payment.refundedAmount !== undefined && (
        <div className={styles.line}>
          <div className={styles.label}>
            {t("chat.paymentLink.statusWidget.field.refundAmount")}
          </div>
          <div className={styles.value}>
            {formatCurrency(toFloat(payment.refundedAmount) ?? 0, currency)}
          </div>
        </div>
      )}

      <div className={styles.line}>
        <div className={styles.label}>
          {t("chat.paymentLink.statusWidget.status")}
        </div>
        <div className={styles.value}>
          {paymentStatusLocales[payment.status]}
        </div>
      </div>
    </div>
  );
}
