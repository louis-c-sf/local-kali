import React, { useMemo } from "react";
import { useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../AppRootContext";
import { equals } from "ramda";
import useStripeCheckout from "../api/User/useStripeCheckout";
import { useSettingsStripeCheckout } from "../api/User/useSettingsStipeCheckout";
import SubscriptionAddOns from "../component/Settings/SettingPlanSubscription/SubscriptionAddOns/SubscriptionAddOns";

const ADDITIONAL_STAFF_STEP = 1;

const AdditionalStaffLoginAddOnContainer = () => {
  const { search } = useLocation();
  const searchParams: URLSearchParams = useMemo(
    () => new URLSearchParams(search),
    [search]
  );
  const currency = searchParams.get("currency");
  const planId = searchParams.get("planId");
  const isFreeTrial = String(searchParams.get("isFreeTrial")) === "true";
  const { t } = useTranslation();
  const { basePlanStaffQuota, currentNumberOfStaff, currentPlanQuota } =
    useAppSelector(
      (s) => ({
        basePlanStaffQuota: s.currentPlan.includedAgents,
        currentNumberOfStaff: s.usage?.currentAgents,
        currentPlanQuota: s.usage?.maximumAgents,
      }),
      equals
    );
  const { stripeCheckout } = useStripeCheckout();
  const { currentUserAddOns } = useSettingsStripeCheckout(currency || "USD");
  const addOnPlan = stripeCheckout?.plans.find((p) => p.id === planId);

  const currentPlanAdditionalQuota =
    currentUserAddOns.additionalStaffLogin.quota;
  return (
    <SubscriptionAddOns
      metaTitle={t(
        "settings.plan.addOn.editAddOnPage.additionalStaffLoginMeta"
      )}
      currentQuotaLabel={t(
        "settings.plan.addOn.editAddOnPage.currentlyUsingStaffLabel",
        {
          currentQuota: currentNumberOfStaff || "",
          maxQuota: currentPlanQuota || "",
        }
      )}
      pricePerLabel={t("settings.plan.addOn.editAddOnPage.pricePerStaff")}
      title={
        isFreeTrial
          ? t("settings.plan.addOn.freeTrial.title")
          : t("settings.plan.addOn.editAddOnPage.additionalStaffLogin")
      }
      planId={planId || ""}
      addOnPlan={addOnPlan}
      currency={currency || ""}
      currentPlanAdditionalQuota={currentPlanAdditionalQuota}
      currentPlanQuota={currentPlanQuota || 0}
      basePlanQuota={basePlanStaffQuota}
      stepperStep={ADDITIONAL_STAFF_STEP}
      isFreeTrial={isFreeTrial}
    />
  );
};

export default AdditionalStaffLoginAddOnContainer;
