import React from "react";
import { Action, StripeCheckoutType } from "../../types/LoginType";
import { GET_STRIPE_SETUP } from "../apiPath";
import { get } from "../apiRequest";

export async function fetchStripeCheckout(
  currency: string,
  dispatch?: React.Dispatch<Action>,
  version?: 8 | 9
) {
  try {
    const stripeCheckout: StripeCheckoutType = await get(GET_STRIPE_SETUP, {
      param: {
        currency,
        version: version || 9,
      },
    });
    dispatch && dispatch({ type: "INITIAL_CHECKOUT", stripeCheckout });
    return stripeCheckout;
  } catch (e) {
    console.error(`fetchStripeCheckout error`, e);
    return null;
  }
}
