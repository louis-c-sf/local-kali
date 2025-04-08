import React, { useMemo } from "react";
import SubscriptionAddOns from "../component/Settings/SettingPlanSubscription/SubscriptionAddOns/SubscriptionAddOns";
import { useLocation } from "react-router";
import { useAppSelector } from "../AppRootContext";
import { equals } from "ramda";
import {
  EXTRA_ADDITIONAL_CONTACT,
  HIDE_CURRENCY_SWITCHER_CURRENCIES,
  NORMAL_ADDITIONAL_CONTACT,
} from "../component/Settings/SettingPlanSubscription/SettingPlanUtils";
import useStripeCheckout from "../api/User/useStripeCheckout";
import { useSettingsStripeCheckout } from "../api/User/useSettingsStipeCheckout";
import { useTranslation } from "react-i18next";

const AdditionalContactsAddOnContainer = () => {
  const { search } = useLocation();
  const searchParams: URLSearchParams = useMemo(
    () => new URLSearchParams(search),
    [search]
  );
  const currency = searchParams.get("currency");
  const planId = searchParams.get("planId");
  const { t } = useTranslation();
  const { basePlanContactQuota, currentPlanQuota, currentNumberOfContacts } =
    useAppSelector(
      (s) => ({
        basePlanContactQuota: s.currentPlan.maximumContact,
        currentPlanQuota: s.usage.maximumContacts,
        currentNumberOfContacts: s.usage.totalContacts,
      }),
      equals
    );
  const additionalContactStep =
    currency && HIDE_CURRENCY_SWITCHER_CURRENCIES.includes(currency)
      ? EXTRA_ADDITIONAL_CONTACT
      : NORMAL_ADDITIONAL_CONTACT;
  const { stripeCheckout } = useStripeCheckout();
  const { currentUserAddOns } = useSettingsStripeCheckout(currency || "USD");
  const addOnPlan = stripeCheckout?.plans.find((p) => p.id === planId);
  const currentPlanAdditionalQuota = currentUserAddOns.additionalContacts.quota;

  return (
    <SubscriptionAddOns
      metaTitle={t("settings.plan.addOn.editAddOnPage.additionalContactsMeta")}
      currentQuotaLabel={t(
        "settings.plan.addOn.editAddOnPage.currentlyUsingContactsLabel",
        { currentQuota: currentNumberOfContacts, maxQuota: currentPlanQuota }
      )}
      pricePerLabel={t("settings.plan.addOn.editAddOnPage.pricePerContacts", {
        quota: additionalContactStep,
      })}
      title={t("settings.plan.addOn.editAddOnPage.additionalContacts")}
      planId={planId || ""}
      addOnPlan={addOnPlan}
      currency={currency || ""}
      currentPlanAdditionalQuota={currentPlanAdditionalQuota}
      currentPlanQuota={currentPlanQuota}
      basePlanQuota={basePlanContactQuota}
      stepperStep={additionalContactStep}
    />
  );
};

export default AdditionalContactsAddOnContainer;
