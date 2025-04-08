import React, { useState } from "react";
import styles from "./StripeOnboardingScreen.module.css";
import { BackLink } from "component/shared/nav/BackLink";
import { useTranslation } from "react-i18next";
import StripeCheckoutIntroduction from "./StripeCheckoutIntroduction";
import StripeOnboardingSteps from "./StripeOnboardingSteps";
import { useHistory, useLocation } from "react-router";
import useRouteConfig from "config/useRouteConfig";
import { useStripeOnboardingStep } from "./StripeOnboardingStepProvider";

export default function StripeOnboardingContainer() {
  const { t } = useTranslation();
  const history = useHistory();
  const location = useLocation();
  const { routeTo } = useRouteConfig();
  const [startConnect, setStartConnect] = useState(false);
  const { currentStep, goToPreviousStep, goTo } = useStripeOnboardingStep();

  // Set to step 2 when Stripe redirects to /onboarding/stripe?stripe-linked=true
  const params = new URLSearchParams(location.search);
  if (params.get("stripe-linked") === "true") {
    if (!startConnect) {
      setStartConnect(true);
    }
    if (currentStep !== 2) {
      goTo(2);
    }
  }

  function handleBack() {
    if (!startConnect) {
      history.push(routeTo("/channels"));
    } else if (startConnect && currentStep === 1) {
      setStartConnect(false);
    } else {
      goToPreviousStep();
    }
  }

  const isCompletedStep = currentStep === 3;

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        {!isCompletedStep && (
          <div>
            <BackLink onClick={handleBack}>
              {startConnect
                ? t("onboarding.ig.back")
                : t("onboarding.ig.backToChannels")}
            </BackLink>
          </div>
        )}
        {!startConnect ? (
          <StripeCheckoutIntroduction
            onClickConnect={() => setStartConnect(true)}
          />
        ) : (
          <StripeOnboardingSteps />
        )}
      </div>
    </div>
  );
}
