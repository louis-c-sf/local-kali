import React from "react";
import { PlanType } from "../../../../types/PlanSelectionType";
import CoreFeaturesSection from "./CoreFeaturesSection";
import IntegrationFeaturesSection from "./IntegrationFeaturesSection";
import {
  CurrentUserAddOns,
  StripeCheckoutPlans,
} from "../../../../api/User/useSettingsStipeCheckout";

export function SettingAddOn({
  currentPlan,
  stripePlans,
  currency,
  currentUserAddOns,
  stripePublicKey,
}: {
  stripePublicKey: string | undefined;
  currency: string;
  stripePlans: StripeCheckoutPlans | undefined;
  currentPlan: PlanType;
  currentUserAddOns: CurrentUserAddOns;
}) {
  return (
    <div className={`container`}>
      <CoreFeaturesSection
        stripePublicKey={stripePublicKey}
        currentUserAddOns={currentUserAddOns}
        stripePlans={stripePlans}
        currentPlan={currentPlan}
        currency={currency}
      />
      <IntegrationFeaturesSection
        currentUserAddOns={currentUserAddOns}
        stripePublicKey={stripePublicKey}
        stripePlans={stripePlans}
        currentPlan={currentPlan}
        currency={currency}
      />
    </div>
  );
}
