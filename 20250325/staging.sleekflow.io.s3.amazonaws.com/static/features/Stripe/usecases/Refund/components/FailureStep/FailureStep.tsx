import React from "react";
import styles from "./FailureStep.module.css";
import Pic from "./assets/warn-circle.svg";
import { useTranslation } from "react-i18next";
import { Button } from "component/shared/Button/Button";

export function FailureStep(props: {
  onDismiss: () => void;
  onRetry: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className={styles.root}>
      <div className={styles.pic}>
        <img src={Pic} />
      </div>
      <div className={styles.header}>
        {t("chat.payment.refund.failure.header")}
      </div>
      <div className={styles.text}>
        {t("chat.payment.refund.failure.description")}
      </div>
      <div className={styles.actions}>
        <Button content={t("form.button.dismiss")} onClick={props.onDismiss} />
        <Button
          content={t("form.button.retry")}
          onClick={props.onRetry}
          primary
        />
      </div>
    </div>
  );
}
