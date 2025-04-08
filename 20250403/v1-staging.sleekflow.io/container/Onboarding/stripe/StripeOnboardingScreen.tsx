import React from "react";
import { PostLogin } from "component/Header";
import Helmet from "react-helmet";
import { useTranslation } from "react-i18next";
import StripeOnboardingContainer from "./StripeOnboardingContainer";
import StripeOnboardingStepProvider from "./StripeOnboardingStepProvider";
import { usePaymentsPolicy } from "../../../core/policies/Ecommerce/Payments/usePaymentsPolicy";
import { Redirect } from "react-router";
import useRouteConfig from "../../../config/useRouteConfig";

function StripeOnboardingScreen() {
  const { t } = useTranslation();
  const paymentsPolicy = usePaymentsPolicy();
  const { routeTo } = useRouteConfig();

  if (!paymentsPolicy.canUseCommercePayments) {
    return <Redirect to={routeTo("/settings/plansubscription")} />;
  }

  return (
    <div className="post-login">
      <PostLogin selectedItem="" />
      <Helmet title={t("onboarding.stripe.pageTitle")} />
      <StripeOnboardingStepProvider>
        <StripeOnboardingContainer />
      </StripeOnboardingStepProvider>
    </div>
  );
}

export default StripeOnboardingScreen;
