import { Button } from "component/shared/Button/Button";
import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./SubscriptionPlanNewVersion.module.css";
export default function SubscriptionPlanNewVersion() {
  const { t } = useTranslation();
  function redirectToV2Setting() {
    window.location.href = `https://${process.env.REACT_APP_V2_PATH}/settings/subscriptions`;
  }
  return (
    <div className={styles.container}>
      <div className={styles.title}>
        {t("account.subscription.newPlan.title")}
      </div>
      <div className={styles.group}>
        <div className={styles.title}>
          {t("account.subscription.newPlan.discover.title")}
        </div>
        <div className={styles.content}>
          {t("account.subscription.newPlan.discover.description")}
        </div>
      </div>
      <div className={styles.group}>
        <div className={styles.title}>
          {t("account.subscription.newPlan.revamped.title")}
        </div>
        <div className={styles.content}>
          {t("account.subscription.newPlan.revamped.description")}
        </div>
      </div>
      <div className={styles.action}>
        <Button primary onClick={redirectToV2Setting}>
          {t("account.subscription.newPlan.button.redirect")}
        </Button>
      </div>
    </div>
  );
}
