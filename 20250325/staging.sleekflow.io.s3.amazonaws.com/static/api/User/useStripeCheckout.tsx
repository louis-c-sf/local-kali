import { fetchStripeCheckout } from "./fetchStripeCheckout";
import { useAppDispatch, useAppSelector } from "../../AppRootContext";
import { equals } from "ramda";
import { fetchShopifySubscriptionPlan } from "./fetchShopifySubscriptionPlan";
import { fetchShopifySubscriptionStatus } from "../Company/fetchShopifySubscriptionStatus";

export default function useStripeCheckout() {
  const stripeCheckout = useAppSelector((s) => s.stripeCheckout, equals);
  const isShopifyAccount = useAppSelector((s) => s.company?.isShopifyAccount);
  const loginDispatch = useAppDispatch();
  async function refreshStripeCheckout(currency?: string) {
    if (!stripeCheckout) {
      if (isShopifyAccount) {
        const subscriptionStatusResponse =
          await fetchShopifySubscriptionStatus();
        if (!subscriptionStatusResponse.subscriptionStatus) {
          fetchShopifySubscriptionPlan(loginDispatch);
        } else {
          fetchStripeCheckout(currency ?? "USD", loginDispatch);
        }
      } else {
        fetchStripeCheckout(currency ?? "USD", loginDispatch);
      }
    }
  }
  return {
    refreshStripeCheckout,
    stripeCheckout,
  };
}
