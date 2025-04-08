import { equals, uniq } from "ramda";
import { useCallback, useEffect, useState } from "react";
import { fetchStripeCheckout } from "../../../api/User/fetchStripeCheckout";
import { useAppSelector } from "../../../AppRootContext";
import { StripePlanType } from "../../../types/LoginType";
import { SubscriptionTier } from "../../../types/PlanSelectionType";

export const PLAN_TIER = [
  SubscriptionTier.Free,
  SubscriptionTier.Pro,
  SubscriptionTier.Premium,
  SubscriptionTier.Enterprise,
];
export const ADDON_PLAN_TIERS = [
  SubscriptionTier.AddOn,
  SubscriptionTier.Agent,
];
export function useStripePlans() {
  const stripeCheckout = useAppSelector((s) => s.stripeCheckout, equals);
  const [selectedPlans, setSelectedPlans] = useState<StripePlanType[]>(
    stripeCheckout?.plans ?? []
  );

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!stripeCheckout) {
      return;
    }
    setSelectedPlans(stripeCheckout.plans);
    setLoading(false);
  }, [stripeCheckout]);

  const updatePlansByCurrency = useCallback((currency: string) => {
    fetchStripeCheckout(currency)
      .then((res) => {
        if (!res?.plans) {
          return;
        }
        setSelectedPlans(res.plans);
      })
      .catch((e) => {
        console.error(`fetchStripeCheckout error ${e}`);
      });
  }, []);
  return {
    selectedPlans,
    updatePlansByCurrency,
    loading,
  };
}
