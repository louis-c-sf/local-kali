import React from "react";
import { PlanType } from "../../../../types/PlanSelectionType";
import { BillRecordsType } from "../../../../types/CompanyType";
import { useTranslation } from "react-i18next";
import { ADDON_PLAN_TIERS } from "../../hooks/useStripePlans";
import styles from "./SettingPlan.module.css";
import PlanIntervalButton from "./PlanIntervalButton";
import SubscriptionPlanTableHeader from "./SubscriptionPlanTableHeader/SubscriptionPlanTableHeader";
import CoreFeatures from "./Features/CoreFeatures";
import AdvancedFeatures from "./Features/AdvancedFeatures";
import { StripeCheckoutPlans } from "../../../../api/User/useSettingsStipeCheckout";

export function ExcludedAddOn(billRecord: BillRecordsType) {
  return (
    billRecord.subscriptionPlan &&
    !ADDON_PLAN_TIERS.includes(billRecord.subscriptionPlan.subscriptionTier)
  );
}

export default function SettingPlan({
  planInterval,
  currency,
  stripePlans,
  togglePlanInterval,
  currentPlan,
  stripePublicKey,
}: {
  stripePlans: StripeCheckoutPlans | undefined;
  planInterval: "yearly" | "monthly";
  currency: string;
  togglePlanInterval: () => void;
  currentPlan: PlanType;
  stripePublicKey: string | undefined;
}) {
  const { t } = useTranslation();
  return (
    <div className={`container plan ${styles.subscriptionPlanContainer}`}>
      <PlanIntervalButton
        togglePlanInterval={togglePlanInterval}
        planInterval={planInterval}
      />
      <SubscriptionPlanTableHeader
        stripePublicKey={stripePublicKey}
        currency={currency}
        plans={stripePlans?.mainSubscriptionPlans}
        planInterval={planInterval}
        togglePlanInterval={togglePlanInterval}
        currentPlan={currentPlan}
      />
      <CoreFeatures
        planInterval={planInterval}
        features={stripePlans?.mainSubscriptionPlans}
      />
      <AdvancedFeatures planInterval={planInterval} />
      <div className={styles.whatsappChannelNotIncluded}>
        {t("settings.plan.subscriptions.whatsappChannelNotIncluded")}
      </div>
    </div>
  );
}
