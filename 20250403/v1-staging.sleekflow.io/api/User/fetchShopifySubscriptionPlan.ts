import React from "react";
import { Action, StripeCheckoutType } from "../../types/LoginType";
import { GET_SHOPIFY_PLAN } from "../apiPath";
import { get } from "../apiRequest";

export async function fetchShopifySubscriptionPlan(
  dispatch: React.Dispatch<Action>
) {
  try {
    const stripeCheckout: StripeCheckoutType = await get(GET_SHOPIFY_PLAN, {
      param: {},
    });

    dispatch({ type: "INITIAL_CHECKOUT", stripeCheckout });
  } catch (e) {
    console.error(`fetchStripeCheckout error`, e);
  }
}
