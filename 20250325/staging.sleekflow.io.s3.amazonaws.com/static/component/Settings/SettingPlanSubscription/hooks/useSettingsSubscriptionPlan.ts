import { Reducer, useEffect, useReducer } from "react";
import { useCountryCode } from "./useCountryCode";
import { useAppSelector } from "../../../../AppRootContext";
import { equals } from "ramda";
import useCountryCodeCurrencyMapping from "../../../../config/localizable/useCountryCodeCurrencyMapping";
import { useSettingsStripeCheckout } from "../../../../api/User/useSettingsStipeCheckout";
import {
  isFreeOrFreemiumPlan,
  isProPlan,
  isYearlyPlan,
} from "../../../../types/PlanSelectionType";
import { ExcludedAddOn } from "../SettingPlan/SettingPlan";
import { getLatestPaidSubscription } from "../SettingPlanSubscriptionHeader";

type SUBSCRIPTION_PLAN_ACTION_TYPE =
  | {
      type: "CHANGE_CURRENCY";
      currency: string;
    }
  | { type: "CHANGE_PLAN_INTERVAL"; interval: "yearly" | "monthly" };

const getInitialSettingPlanSubscriptionValue: (currency: string) => {
  currency: string;
  planInterval: "yearly" | "monthly";
} = (currency) => ({
  currency: currency,
  planInterval: "yearly",
});

const SettingPlanSubscriptionReducer = (
  state: {
    currency: string;
    planInterval: "yearly" | "monthly";
  },
  action: SUBSCRIPTION_PLAN_ACTION_TYPE
) => {
  switch (action.type) {
    case "CHANGE_CURRENCY":
      return { ...state, currency: action.currency };
    case "CHANGE_PLAN_INTERVAL":
      return { ...state, planInterval: action.interval };
    default:
      return state;
  }
};

export const useSettingsSubscriptionPlan = () => {
  const { currentPlan, isSubscriptionActive, currentPlanCurrency } =
    useAppSelector(
      (s) => ({
        currentPlan: s.currentPlan,
        isSubscriptionActive: s.company?.isSubscriptionActive,
        currentPlanCurrency: s.currentPlan?.currency || "USD",
      }),
      equals
    );
  const latestPaidSubscription = useAppSelector(
    (s) => getLatestPaidSubscription(s.company?.billRecords ?? []),
    equals
  );
  const isCurrentPlanFree = isFreeOrFreemiumPlan(currentPlan);
  const [state, dispatch] = useReducer<
    Reducer<
      {
        currency: string;
        planInterval: "yearly" | "monthly";
      },
      SUBSCRIPTION_PLAN_ACTION_TYPE
    >
  >(
    SettingPlanSubscriptionReducer,
    getInitialSettingPlanSubscriptionValue(
      !isCurrentPlanFree ? currentPlanCurrency : "USD"
    )
  );

  const { loading: countryCodeLoading, countryCode: countryCodeFromIp } =
    useCountryCode();

  const mainSubscriptionPlansLoading = countryCodeLoading;
  const addOnPlansLoading = countryCodeLoading;
  const countryCode = countryCodeFromIp || "US";

  const { currency: initialCurrencyFromCountryCode } =
    useCountryCodeCurrencyMapping(countryCode);
  const isShopifyAccount = useAppSelector((s) => s.company?.isShopifyAccount);
  const {
    stripePlans,
    currentUserAddOns,
    loading: stripePlansLoading,
    publicKey,
  } = useSettingsStripeCheckout(state.currency);

  const subscriptionPlansLoading = countryCodeLoading || stripePlansLoading;

  const setSelectedCurrency = (currency: string) => {
    return dispatch({
      type: "CHANGE_CURRENCY",
      currency,
    });
  };

  const togglePlanInterval = () => {
    dispatch({
      type: "CHANGE_PLAN_INTERVAL",
      interval: state.planInterval === "yearly" ? "monthly" : "yearly",
    });
  };

  useEffect(() => {
    if (isFreeOrFreemiumPlan(currentPlan)) {
      if (latestPaidSubscription) {
        return setSelectedCurrency(
          latestPaidSubscription.subscriptionPlan.currency.toUpperCase()
        );
      }
      return setSelectedCurrency(
        isShopifyAccount ? "USD" : initialCurrencyFromCountryCode
      );
    }
    setSelectedCurrency(currentPlanCurrency.toUpperCase());
  }, [
    initialCurrencyFromCountryCode,
    isSubscriptionActive,
    currentPlanCurrency,
    currentPlan,
    isShopifyAccount,
    latestPaidSubscription,
  ]);

  return {
    stripePublicKey: publicKey,
    currentUserAddOns,
    loading: subscriptionPlansLoading,
    addOnPlansLoading,
    mainSubscriptionPlansLoading,
    countryCode,
    currency: state.currency,
    currentPlan,
    stripePlans,
    planInterval: state.planInterval,
    setSelectedCurrency,
    togglePlanInterval,
  };
};
