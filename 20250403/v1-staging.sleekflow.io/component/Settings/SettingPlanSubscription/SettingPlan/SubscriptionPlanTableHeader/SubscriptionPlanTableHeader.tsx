import React from "react";
import styles from "./SubscriptionPlanTableHeader.module.css";
import { Trans, useTranslation } from "react-i18next";
import { ContactSupportPrompt } from "../../ContactSupportPrompt";
import { PlanType } from "../../../../../types/PlanSelectionType";
import { TFunction } from "i18next";
import { IndividualSubscriptionPlanHeader } from "./IndividualSubscriptionPlanHeader";
import { StripeCheckoutMainPlans } from "../../../../../api/User/useSettingsStipeCheckout";

const getPlanHeaderInfo = (t: TFunction) => [
  {
    plan: "free",
    priceLabel: (values: { currency: string; price: number }) => (
      <Trans
        i18nKey={"settings.plan.subscriptions.lifetimePriceLabel"}
        values={values}
      >
        Free
        <span className={styles.pricePeriodLabel}>Lifetime</span>
      </Trans>
    ),
    title: t("settings.plan.subscriptions.startup"),
  },
  {
    plan: "pro",
    title: t("settings.plan.subscriptions.pro"),
    priceLabel: (values: { currency: string; price: number }) => (
      <Trans i18nKey={"settings.plan.priceLabel"} values={values}>
        Free
        <span className={styles.pricePeriodLabel}>Lifetime</span>
      </Trans>
    ),
    savingsInfo: t("settings.plan.subscriptions.savings", { percentage: 25 }),
  },
  {
    plan: "premium",
    priceLabel: (values: { currency: string; price: number }) => (
      <Trans i18nKey={"settings.plan.priceLabel"} values={values}>
        Free
        <span className={styles.pricePeriodLabel}>Lifetime</span>
      </Trans>
    ),
    title: t("settings.plan.subscriptions.premium"),
    savingsInfo: t("settings.plan.subscriptions.savings", {
      percentage: 15,
    }),
  },
];

const SubscriptionPlanTableHeader = ({
  plans,
  togglePlanInterval,
  planInterval,
  currentPlan,
  currency,
  stripePublicKey,
}: {
  stripePublicKey: string | undefined;
  currency: string;
  plans: undefined | StripeCheckoutMainPlans;
  togglePlanInterval: () => void;
  planInterval: "yearly" | "monthly";
  currentPlan: PlanType;
}) => {
  const { t } = useTranslation();

  const planHeaderInfo = getPlanHeaderInfo(t);

  return (
    <table className={styles.subscriptionTableHeaderWrapper}>
      <thead>
        <tr>
          <th>
            <ContactSupportPrompt
              contactSupportMessage={t(
                "settings.plan.subscriptions.contactSupportMessage"
              )}
              title={t("settings.plan.title")}
            >
              {t("settings.plan.subscriptions.needHelp")}
            </ContactSupportPrompt>
          </th>
          {planHeaderInfo.map((planInfo) => {
            return (
              <IndividualSubscriptionPlanHeader
                key={planInfo.plan}
                stripePublicKey={stripePublicKey}
                planId={plans?.[planInterval]?.[planInfo.plan]?.id}
                togglePlanInterval={togglePlanInterval}
                planInterval={planInterval}
                currentPlan={currentPlan}
                title={planInfo.title}
                priceLabel={planInfo.priceLabel({
                  currency: currency,
                  price:
                    plans?.[planInterval]?.[planInfo.plan]?.displayAmount ||
                    t("settings.plan.subscriptions.free"),
                })}
                plan={planInfo.plan}
                savingsInfo={
                  planInterval === "yearly" ? planInfo.savingsInfo : ""
                }
              />
            );
          })}
        </tr>
      </thead>
    </table>
  );
};

export default SubscriptionPlanTableHeader;
