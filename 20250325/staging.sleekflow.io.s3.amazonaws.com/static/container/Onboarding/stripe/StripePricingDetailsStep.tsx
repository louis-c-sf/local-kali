import React, { useState } from "react";
import { useStripeOnboardingStep } from "./StripeOnboardingStepProvider";
import mainStyles from "./StripeOnboardingScreen.module.css";
import styles from "./StripePricingDetailsStep.module.css";
import { Button } from "component/shared/Button/Button";
import { useTranslation } from "react-i18next";
import { defaultCountryOpts } from "./StripeCreateAccountStep";
import { equals } from "ramda";
import { useAppSelector } from "AppRootContext";
import { redirectToStripe } from "lib/stripe/redirectToStripe";
import { useSettingsSubscriptionPlan } from "component/Settings/SettingPlanSubscription/hooks/useSettingsSubscriptionPlan";
import { isPremiumPlan, isYearlyPlan } from "types/PlanSelectionType";

export default function StripePricingDetailsStep() {
  const { trackingUrl, goToNextStep, country } = useStripeOnboardingStep();
  const { t } = useTranslation();
  const countryFee = defaultCountryOpts(t).find((opt) => opt.value === country);
  const currentPlan = useAppSelector((s) => s.currentPlan, equals);
  const isPaymentIntegrationEnabled = useAppSelector(
    (s) => s.company?.addonStatus?.isPaymentIntegrationEnabled
  );

  const { stripePlans, stripePublicKey } = useSettingsSubscriptionPlan();
  const [loading, setLoading] = useState(false);

  async function paymentChecking() {
    if (!isPaymentIntegrationEnabled) {
      if (!stripePublicKey || !stripePlans) {
        return;
      }
      const isCurrentPlanPremium = isPremiumPlan(currentPlan)
        ? "premium"
        : "pro";
      const paymentPlanId =
        stripePlans.addOnPlans?.integrationFeatures![
          isYearlyPlan(currentPlan) ? "yearly" : "monthly"
        ][isCurrentPlanPremium]["paymentIntegration"].id;
      if (!paymentPlanId) {
        return;
      }
      setLoading(true);
      try {
        await redirectToStripe({
          planId: paymentPlanId,
          stripePublicKey: stripePublicKey,
        });
      } catch (e) {
        console.error(`redirectToStripe ${e}`);
      } finally {
        setLoading(false);
      }
    } else {
      if (trackingUrl) {
        window.open(trackingUrl);
      }
      goToNextStep();
    }
  }

  return (
    <div className={mainStyles.contentContainer}>
      <p className={styles.title}>
        {t("onboarding.stripe.steps.pricingDetail")}
      </p>
      <div className={styles.feeItem}>
        <p>{t("onboarding.stripe.pricingDetail.setupFee")}</p>
        <p>
          {countryFee?.setupfee || ""}
          <span className={styles.helper}>
            {t("onboarding.stripe.pricingDetail.month")}
          </span>
        </p>
      </div>
      <p className={styles.feeDescription}>
        {t("onboarding.stripe.pricingDetail.setupFeeDescription")}
      </p>
      <div className={styles.feeItem}>
        <p>{t("onboarding.stripe.pricingDetail.paymentFee")}</p>
        <p>
          {countryFee?.paymentfee || ""}
          <span className={styles.helper}>
            {t("onboarding.stripe.pricingDetail.payment")}
          </span>
        </p>
      </div>
      <p className={styles.feeDescription}>
        {t("onboarding.stripe.pricingDetail.paymentFeeDescription")}
      </p>
      <p className={styles.disclaimerTitle}>
        {t("onboarding.stripe.pricingDetail.disclaimer")}
      </p>
      <p className={styles.disclaimerDescription}>
        {t("onboarding.stripe.pricingDetail.disclaimerDescription")}
      </p>
      <Button
        loading={loading}
        disabled={loading}
        primary
        className="fluid"
        onClick={paymentChecking}
      >
        {t("onboarding.stripe.pricingDetail.connectButton")}
      </Button>
      <p className={styles.policyMessage}>
        {t("onboarding.stripe.pricingDetail.policyMessage")}
      </p>
    </div>
  );
}
