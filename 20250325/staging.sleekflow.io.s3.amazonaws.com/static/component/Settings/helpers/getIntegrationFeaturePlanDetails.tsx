import {
  StripeCheckoutCoreFeatures,
  StripeCheckoutIntegrationFeatures,
} from "api/User/useSettingsStipeCheckout";
import { StripePlanType } from "types/LoginType";
import { isProPlan, isYearlyPlan, PlanType } from "types/PlanSelectionType";

export function getIntegrationFeaturePlanDetails(
  currentPlan: PlanType,
  coreFeatures:
    | StripeCheckoutCoreFeatures
    | StripeCheckoutIntegrationFeatures
    | undefined,
  id:
    | "shopifyIntegration"
    | "paymentIntegration"
    | "hubspotIntegration"
    | "salesforceCRMIntegration"
    | "additionalStaffLogin"
    | "additionalContacts"
    | "unlimitedMessagingChannels"
    | "sensitiveDataMasking"
    | "whatsappQrCode"
): StripePlanType {
  const isCurrentPlanPro = isProPlan(currentPlan);
  const isCurrentPlanYearly = isYearlyPlan(currentPlan);
  const coreFeaturePlanDetails =
    coreFeatures &&
    coreFeatures[isCurrentPlanYearly ? "yearly" : "monthly"][
      isCurrentPlanPro ? "pro" : "premium"
    ][id];
  return coreFeaturePlanDetails;
}
