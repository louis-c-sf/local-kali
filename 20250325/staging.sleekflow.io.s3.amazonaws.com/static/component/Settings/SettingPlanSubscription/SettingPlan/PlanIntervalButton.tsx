import { useTranslation } from "react-i18next";
import styles from "./PlanIntervalButton.module.css";
import React from "react";

const PlanIntervalButton = ({
  planInterval,
  togglePlanInterval,
}: {
  planInterval: "monthly" | "yearly";
  togglePlanInterval: () => void;
}) => {
  const { t } = useTranslation();
  return (
    <button
      onClick={togglePlanInterval}
      className={styles.intervalButtonWrapper}
    >
      <div
        className={`${styles.intervalButtonActiveIndicator} ${
          planInterval === "monthly" ? styles.monthlyIntervalActive : ""
        }`}
      />
      <div
        className={`${styles.intervalButtonYearly} ${
          planInterval === "yearly" ? styles.intervalButtonActive : ""
        }`}
      >
        {t("settings.plan.subscriptions.yearly")}
      </div>
      <div
        className={`${styles.intervalButtonMonthly} ${
          planInterval === "monthly" ? styles.intervalButtonActive : ""
        }`}
      >
        {t("settings.plan.subscriptions.monthly")}
      </div>
    </button>
  );
};

export default PlanIntervalButton;
