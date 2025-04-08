import React from "react";
import commonStyles from "../../../container/SettingPlanSubscription.module.css";
import { Button } from "../../shared/Button/Button";
import { useTranslation } from "react-i18next";
import styles from "./ExploreEnterpriseSection.module.css";
import LightBulb from "../../../assets/tsx/icons/LightBulb";

const ExploreEnterpriseSection = () => {
  const { t } = useTranslation();
  return (
    <div
      className={`${commonStyles.planSubscriptionContent} ${styles.planSubscriptionExploreEnterprise}`}
    >
      <div className={styles.exploreEnterpriseLabel}>
        {t("settings.plan.subscriptions.exploreEnterprisePlan")}
        <LightBulb className={styles.lightBulbIcon} />
      </div>
      <div className={styles.exploreEnterpriseDescription}>
        {t("settings.plan.subscriptions.exploreEnterprisePlanDescription")}
      </div>
      <a
        href={"https://sleekflow.io/book-a-demo"}
        target={"_blank"}
        rel="noreferrer nofollow noopener"
        className={styles.consultUsButton}
      >
        <Button primary>{t("settings.plan.addOn.button.consultUs")}</Button>
      </a>
    </div>
  );
};

export default ExploreEnterpriseSection;
