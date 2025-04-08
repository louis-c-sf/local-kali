import { TFunction } from "i18next";
import { redirectToStripe } from "lib/stripe/redirectToStripe";
import React from "react";
import { htmlEscape } from "../../../lib/utility/htmlEscape";

export const NORMAL_ADDITIONAL_CONTACT = 2000;
export const EXTRA_ADDITIONAL_CONTACT = 5000;
export const UNLIMITED_QUOTA = 50000000;
export const HIDE_CURRENCY_SWITCHER_COUNTRYCODES = ["MY", "BR", "ID", "AE"];
export const HIDE_CURRENCY_SWITCHER_CURRENCIES = ["IDR", "MYR", "BRL", "INR"];

export const INTEGRATION_FEATURES_ADDONS = [
  "shopifyIntegration",
  "paymentIntegration",
  "hubspotIntegration",
  "salesforceCRMIntegration",
] as const;

export const CORE_FEATURES_ADDONS = [
  "additionalStaffLogin",
  "additionalContacts",
  "unlimitedMessagingChannels",
  "sensitiveDataMasking",
  "whatsappQrCode",
] as const;

export const SUPPORT_PLANS = [
  "onboardingSupport",
  "prioritySupport",
  "chatbotAutomationSetup",
] as const;

export const formatQuotaValues = (quota: number | string | Number) => {
  if (typeof quota === "string") {
    return quota;
  }
  return quota?.toLocaleString("en-US");
};

export const onClickRedirectToStripe = async ({
  setLoading,
  flash,
  planId,
  stripePublicKey,
  quantity = 1,
  t,
  isFreeTrial = false,
  data = {},
  shopifyConfigId,
}: {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  t: TFunction;
  flash: (message: React.ReactNode) => Promise<void>;
  planId: string | undefined | null;
  stripePublicKey: string | undefined;
  quantity?: number;
  data?: object | string;
  isFreeTrial?: boolean;
  shopifyConfigId?: string;
}) => {
  if (planId && stripePublicKey) {
    setLoading(true);
    flash(t("flash.stripe.redirecting"));
    try {
      await redirectToStripe({
        planId,
        stripePublicKey,
        quantity,
        isFreeTrial,
        data,
        shopifyConfigId,
      });
    } catch (e) {
      flash(t("flash.stripe.error.unknown", { error: `${htmlEscape(e)}` }));
      console.log(e);
    } finally {
      setLoading(false);
    }
  }
};
