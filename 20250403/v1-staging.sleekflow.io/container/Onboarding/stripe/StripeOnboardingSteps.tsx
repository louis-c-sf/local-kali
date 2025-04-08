import { Stepper } from "react-form-stepper";
import React from "react";
import { useStripeOnboardingStep } from "./StripeOnboardingStepProvider";
import StripeCreateAccountStep from "./StripeCreateAccountStep";
import styles from "./StripeOnboardingSteps.module.css";
import StripeImportProductStep from "./StripeImportProductStep/StripeImportProductStep";
import StripeOnboardingCompleteStep from "./StripeOnboardingCompleteStep";
import { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import StripePricingDetailsStep from "./StripePricingDetailsStep";

const STYLE_CONFIG = {
  activeBgColor: "#6078ff",
  activeTextColor: "white",
  completedBgColor: "#6078ff",
  completedTextColor: "white",
  inactiveBgColor: "#e0e0e0",
  inactiveTextColor: "#ffffff",
  size: "2em",
  circleFontSize: "1em",
  labelFontSize: "16px",
  borderRadius: "50%",
  fontWeight: 500,
};

function getSteps(t: TFunction) {
  return [
    t("onboarding.stripe.steps.createAccount"),
    t("onboarding.stripe.steps.pricingDetail"),
    t("onboarding.stripe.steps.importProduct"),
    t("onboarding.stripe.steps.complete"),
  ];
}

export default function StripeOnboardingSteps() {
  const { currentStep } = useStripeOnboardingStep();
  const { t } = useTranslation();

  return (
    <div className={styles.stepContainer}>
      <Stepper
        activeStep={currentStep - 1}
        steps={getSteps(t).map((step) => ({ label: step }))}
        styleConfig={STYLE_CONFIG}
      />
      {currentStep === 1 && <StripeCreateAccountStep />}
      {currentStep === 2 && <StripePricingDetailsStep />}
      {currentStep === 3 && <StripeImportProductStep />}
      {currentStep === 4 && <StripeOnboardingCompleteStep />}
    </div>
  );
}
