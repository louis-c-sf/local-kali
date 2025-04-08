import { postWithExceptions } from "../../api/apiRequest";
import { POST_STRIPE_CHECKOUT_V2 } from "../../api/apiPath";

// DEV NOTE: v2 create stripe checkout API doesn't work with add-ons
interface SubscriptionParamType {
  planId: string | undefined | null;
  quantity?: number;
  isFreeTrial?: boolean;
  shopifyConfigId?: string;
}
export async function redirectToStripe({
  planId,
  stripePublicKey,
  quantity = 1,
  data = {},
  isFreeTrial = false,
  shopifyConfigId,
}: {
  planId: string | undefined | null;
  stripePublicKey: string | undefined;
  quantity?: number;
  data?: object | string;
  isFreeTrial?: boolean;
  shopifyConfigId?: string;
}) {
  let subscriptionItemParam: SubscriptionParamType = {
    planId: planId,
    quantity,
    isFreeTrial,
  };
  if (shopifyConfigId) {
    subscriptionItemParam = {
      ...subscriptionItemParam,
      shopifyConfigId,
    };
  }
  const result = await postWithExceptions(POST_STRIPE_CHECKOUT_V2, {
    param: {
      subscriptionItems: [{ ...subscriptionItemParam }],
      data: JSON.stringify(data),
    },
  });

  const stripe = window.Stripe(stripePublicKey);
  if (!stripe) {
    throw { message: "Missing stripe" };
  }
  stripe.redirectToCheckout({
    sessionId: result.id,
  });
}
