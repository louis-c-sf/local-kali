import SettingPlan from "./SettingPlan/SettingPlan";
import React from "react";
import { SettingAddOn } from "./SettingAddOn/SettingAddOn";
import { isFreeOrFreemiumPlan, PlanType } from "types/PlanSelectionType";
import SettingPaymentInformation from "./SettingPaymentInformation";
import SettingInvoice from "./SettingInvoice/SettingInvoice";
import { Dimmer, Loader } from "semantic-ui-react";
import {
  CurrentUserAddOns,
  StripeCheckoutPlans,
} from "api/User/useSettingsStipeCheckout";
import AccountData from "./SettingPlan/AccountData";
import SupportPlans from "./SupportPlans/SupportPlans";
import { useFeaturesGuard } from "../hooks/useFeaturesGuard";

const SettingSubscriptionTabs = ({
  loading,
  planInterval,
  currency,
  togglePlanInterval,
  currentPlan,
  stripePlans,
  selectedTab,
  stripePublicKey,
  currentUserAddOns,
}: {
  loading: boolean;
  planInterval: "yearly" | "monthly";
  currency: string;
  togglePlanInterval: () => void;
  currentPlan: PlanType;
  stripePlans: StripeCheckoutPlans | undefined;
  selectedTab: string;
  stripePublicKey: string | undefined;
  currentUserAddOns: CurrentUserAddOns;
}) => {
  const featureGuard = useFeaturesGuard();

  if (loading) {
    return (
      <Dimmer inverted active>
        <Loader />
      </Dimmer>
    );
  }

  if (selectedTab === "Subscriptions") {
    return (
      <SettingPlan
        stripePublicKey={stripePublicKey}
        stripePlans={stripePlans}
        planInterval={planInterval}
        currency={currency}
        togglePlanInterval={togglePlanInterval}
        currentPlan={currentPlan}
      />
    );
  }

  if (
    selectedTab === "AddOn" &&
    !isFreeOrFreemiumPlan(currentPlan) &&
    !featureGuard.isShopifyAccount()
  ) {
    return (
      <SettingAddOn
        stripePublicKey={stripePublicKey}
        currentUserAddOns={currentUserAddOns}
        currency={currency}
        stripePlans={stripePlans}
        currentPlan={currentPlan}
      />
    );
  }

  if (
    selectedTab === "SupportPlans" &&
    !isFreeOrFreemiumPlan(currentPlan) &&
    !featureGuard.isShopifyAccount()
  ) {
    return (
      <SupportPlans
        currentUserAddOns={currentUserAddOns}
        stripePublicKey={stripePublicKey}
        currentPlan={currentPlan}
        stripePlans={stripePlans}
        currency={currency}
      />
    );
  }

  if (selectedTab === "AccountData" && !featureGuard.isShopifyAccount()) {
    return <AccountData />;
  }

  if (
    !isFreeOrFreemiumPlan(currentPlan) &&
    selectedTab === "Billing" &&
    !featureGuard.isShopifyAccount()
  ) {
    return (
      <>
        <SettingPaymentInformation />
        <SettingInvoice />
      </>
    );
  }

  return null;
};

export default SettingSubscriptionTabs;
