import { POST_SHOPIFY_PLAN } from "api/apiPath";
import { post } from "api/apiRequest";
import submitShopifySubscription from "api/StripePayment/submitShopifySubscription";

export interface ShopifySubscriptionResponseType {
  url: string;
}
export default async function postSubscribeShopifyPlan(
  planId: string,
  subscriptionStatus?: boolean
): Promise<ShopifySubscriptionResponseType> {
  if (subscriptionStatus) {
    return await submitShopifySubscription(planId);
  } else {
    return await post(POST_SHOPIFY_PLAN, {
      param: {
        planId,
      },
    });
  }
}
