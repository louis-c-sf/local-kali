import React from "react";
import styles from "./SuccessStep.module.css";
import { useTranslation } from "react-i18next";
import CircleImg from "./assets/tick-circle.svg";
import { Button } from "../../../../../../component/shared/Button/Button";
import { formatCurrency } from "../../../../../../utility/string";

export function SuccessStep(props: {
  amount: number;
  amountCurrency: string;
  refundId: string;
  onClose: () => void;
}) {
  let { amount, amountCurrency, onClose, refundId } = props;
  const { t } = useTranslation();
  return (
    <div className={styles.root}>
      <div className={styles.pic}>
        <img
          src={CircleImg}
          alt={t("chat.payment.refund.dialog.success.head")}
        />
      </div>
      <div className={styles.head}>
        {t("chat.payment.refund.dialog.success.head")}
      </div>
      <div className={styles.details}>
        <div>
          {t("chat.payment.refund.dialog.success.amount")}:{" "}
          {formatCurrency(amount, amountCurrency)}
        </div>
        <div>
          {t("chat.payment.refund.dialog.success.id")}: {refundId}
        </div>
      </div>
      <div className={styles.actions}>
        <Button content={t("form.button.done")} onClick={onClose} primary />
      </div>
    </div>
  );
}
