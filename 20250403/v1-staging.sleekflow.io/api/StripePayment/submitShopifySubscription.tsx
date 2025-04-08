import { putMethod } from "api/apiRequest";
import { ShopifySubscriptionResponseType } from "api/Shopify/postSubscribeShopifyPlan";

export default async function submitShopifySubscription(
  planId: string
): Promise<ShopifySubscriptionResponseType> {
  return putMethod("/shopify/subscription", {
    param: {
      planId,
    },
  });
}
