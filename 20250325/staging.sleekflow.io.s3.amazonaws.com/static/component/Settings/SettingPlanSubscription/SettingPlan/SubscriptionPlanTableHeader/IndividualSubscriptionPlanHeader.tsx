import { PlanType } from "../../../../../types/PlanSelectionType";
import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./SubscriptionPlanTableHeader.module.css";
import { ChangePlanButton } from "../ChangePlanButton";

export const IndividualSubscriptionPlanHeader = ({
  title,
  priceLabel,
  plan,
  savingsInfo,
  togglePlanInterval,
  planInterval,
  currentPlan,
  planId,
  stripePublicKey,
}: {
  togglePlanInterval: () => void;
  planInterval: "yearly" | "monthly";
  currentPlan: PlanType;
  title: string;
  priceLabel: string | React.ReactNode;
  plan: string;
  savingsInfo?: string;
  planId: string | undefined;
  stripePublicKey: string | undefined;
}) => {
  const { t } = useTranslation();
  const isSwitchYearlyShown =
    planInterval !== "yearly" &&
    currentPlan.id.includes(plan) &&
    currentPlan.id.includes(planInterval);

  return (
    <th>
      <div className={styles.subscriptionTableHeaderPlansWrapper}>
        <div className={styles.subscriptionTableHeaderPlans}>{title}</div>
        <div className={styles.freePriceLabel}>{priceLabel}</div>
        <ChangePlanButton
          planId={planId}
          stripePublicKey={stripePublicKey}
          planInterval={planInterval}
          plan={plan}
          currentPlan={currentPlan}
        />
        {isSwitchYearlyShown && (
          <button
            onClick={togglePlanInterval}
            className={styles.switchYearlyButton}
          >
            {t("settings.plan.subscriptions.switchToYearPlan")}
          </button>
        )}
        {savingsInfo && (
          <div className={styles.savingsInfoLabel}>{savingsInfo}</div>
        )}
      </div>
    </th>
  );
};
